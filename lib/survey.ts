const WELCOME_MESSAGE_VALID = "Maligayang pagdating sa STAR S.H.I.P.! Ang iyong katuwang sa pag-update ng teacher profile para sa mga liblib na komunidad, walang internet na kailangan. Maraming salamat sa inyong serbisyo para sa edukasyon!\n\nAccess Code Verified para sa: {school_name}";

const WELCOME_MESSAGE_INVALID = "Magandang araw, ito ang DOST STAR S.H.I.P! Ang iyong School ID ay hindi kasali sa aming listahan, maari niyo pong icheck kung tama ang naisend na School ID bago magsend muli, salamat!";

const DISPLAY_MESSAGES = {
  CONFIRM: "Bilang ng device: {devices} (i-text ang ULIT kung mali)\n\ni-text ang GO kung Tama.",
  SUMMARY: "Maraming salamat, teacher! Narito ang mga impormasyon na iyong binigay:\n\nDepEd ID: {deped_id}\nPangalan: {full_name}\nEdad: {age}\nTagal ng pagtuturo: {years} years\nPosisyon: {position}\nEspesiyalisasyon: {specialization}\nBilang ng device: {devices}\n\nMatagumpay na na-submit ang iyong profile! Maraming salamat sa iyong pakikilahok.\n\nAng iyong impormasyon ay ligtas na nakatago sa STAR S.H.I.P. database at makakatulong sa pagpapabuti ng ating serbisyo para sa mga guro.",
  SUCCESS: "Matagumpay na na-submit ang iyong profile! Maraming salamat sa iyong pakikilahok.\n\nAng iyong impormasyon ay ligtas na nakatago sa STAR S.H.I.P. database at makakatulong sa pagpapabuti ng ating serbisyo para sa mga guro.\n\nI-text ang UPDATE anumang oras kung nais mong baguhin ang iyong profile\n\nMaraming salamat, teacher!"
};

let editFieldCache: Record<string, string> = {};

async function sendSms(to: string, message: string) {
  console.log(`[SMS] Sending to ${to}: ${message.substring(0, 50)}...`);
  const apiKey = process.env.HTTPSMS_API_KEY;
  const fromNumber = process.env.FROM_NUMBER;
  
  if (to === fromNumber) {
    console.log(`[SMS] Skipping: message from own number`);
    return;
  }
  if (!apiKey || !fromNumber) {
    console.log(`[SMS] Skipping: missing API key or from number`);
    return;
  }

  try {
    const response = await fetch("https://api.httpsms.com/v1/messages/send", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        from: fromNumber,
        to: to
      })
    });
    console.log(`[SMS] Response status:`, response.status);
  } catch (error) {
    console.error("[SMS Error]", error);
  }
}

function convertWordToNumber(text: string): number | null {
  const wordMap: Record<string, number> = {
    "isa": 1, "dalawa": 2, "tatlo": 3, "apat": 4, "lima": 5,
    "anim": 6, "pito": 7, "walo": 8, "siam": 9, "sampu": 10,
    "dalawampu": 20, "tatlumpu": 30, "apatnapu": 40, "limampu": 50,
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50
  };
  return wordMap[text.toLowerCase().trim()] ?? null;
}

function parseYears(text: string): number | null {
  const cleaned = text.toLowerCase().replace(/(taon|years|yr)/g, "").trim();
  const wordResult = convertWordToNumber(cleaned);
  if (wordResult !== null) return wordResult;
  const num = parseInt(cleaned, 10);
  if (!isNaN(num) && num > 0 && num < 100) return num;
  return null;
}

async function validateSchoolId(schoolId: string, db: any) {
  const validSchools = await db.getAllSchools();
  const school = validSchools.find((s: any) => s.school_id === schoolId);
  if (school) return { valid: true, schoolName: school.name };
  return { valid: false, schoolName: null };
}

function getFullName(user: any): string {
  return `${user.last_name || ''}, ${user.first_name || ''}, ${user.middle_name || ''}, ${user.suffix_name || ''}`.replace(/^, |, $/g, '').replace(/, $/g, ', ').trim();
}

export async function processSurvey(phone: string, text: string) {
  try {
    const db = await import("@/lib/db");
    const userText = text.trim();
    const lower = userText.toLowerCase();
    
    const userRow = await db.getUserByPhone(phone);
    
    if (!userRow) {
      const schoolValidation = await validateSchoolId(userText, db);
      
      if (schoolValidation.valid) {
        await db.createUser(phone);
        await db.updateBioByPhone(phone, "school_id", userText, 2);
        
        const welcomeMsg = WELCOME_MESSAGE_VALID.replace("{school_name}", schoolValidation.schoolName || "Unknown School");
        await sendSms(phone, welcomeMsg);
        await sendSms(phone, "I-text ang iyong DepEd ID (Hal. DEPED123): ");
      } else {
        await db.createUser(phone);
        await sendSms(phone, WELCOME_MESSAGE_INVALID);
      }
      return;
    }

    const fullUser = await db.getUserByPhone(phone);
    if (!fullUser) return;
    
    const step = fullUser.step || 0;
    const errors = fullUser.errors || 0;
    let deped_id = fullUser.deped_id;
    
    console.log(`[DEBUG] Phone: ${phone}, Step: ${step}, Input: "${userText}"`);
    console.log(`[DEBUG] Will check: step === 20 is ${step === 20}`);
    
    let professionalData: any = null;
    if (deped_id) {
      professionalData = await db.getProfessionalById(deped_id);
    }

    if (lower === "update" && step >= 12) {
      await db.updateStep(deped_id, 12);
      delete editFieldCache[phone];
      
      const summary = DISPLAY_MESSAGES.SUMMARY
        .replace("{deped_id}", deped_id)
        .replace("{full_name}", getFullName(fullUser))
        .replace("{age}", fullUser.age || "?")
        .replace("{years}", professionalData?.years_experience?.toString() || "?")
        .replace("{position}", professionalData?.role_position || "?")
        .replace("{specialization}", professionalData?.specialization || "?")
        .replace("{devices}", professionalData?.device_count?.toString() || "?");
      
      await sendSms(phone, summary);
      return;
    }

    if (step === 14) {
      await sendSms(phone, DISPLAY_MESSAGES.SUCCESS);
      await db.updateStep(deped_id, 15);
      return;
    }

    if (step >= 15) {
      return;
    }

    if (step === 1) {
      const schoolValidation = await validateSchoolId(userText, db);
      
      if (schoolValidation.valid) {
        await db.updateBioByPhone(phone, "school_id", userText, 2);
        
        const welcomeMsg = WELCOME_MESSAGE_VALID.replace("{school_name}", schoolValidation.schoolName || "Unknown School");
        await sendSms(phone, welcomeMsg);
        await sendSms(phone, "I-text ang iyong DepEd ID (Hal. DEPED123): ");
      } else {
        if (errors < 1) await db.incrementError(deped_id);
        await sendSms(phone, WELCOME_MESSAGE_INVALID);
      }
      return;
    }

    if (step === 2) {
      await db.updateBioByPhone(phone, "deped_id", userText, 3);
      
      const namePrompt = `DepEd ID: ${userText} (i-text ang ULIT kung mali)\n\nAno naman ang iyong buong pangalan? [Apilyido],[Unang Pangalan],[Gitnang Pangalan],[Suffix]\n\nHal. Castillo, Joemarc, Batumbakal, Jr.`;
      await sendSms(phone, namePrompt);
      return;
    }

    if (step === 3) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 2);
        await sendSms(phone, "I-text ang iyong DepEd ID: ");
        return;
      }
      
      const parts = userText.split(",").map(p => p.trim());
      if (parts[0]) await db.updateBioByPhone(phone, "last_name", parts[0], 4);
      if (parts[1]) await db.updateBioByPhone(phone, "first_name", parts[1], 4);
      if (parts[2]) await db.updateBioByPhone(phone, "middle_name", parts[2], 4);
      if (parts[3]) await db.updateBioByPhone(phone, "suffix_name", parts[3], 4);
      
      const fullName = `${parts[0] || ''}, ${parts[1] || ''}, ${parts[2] || ''}, ${parts[3] || ''}`.replace(/^, |, $/g, '').replace(/, $/g, ', ').trim();
      await sendSms(phone, `${fullName} (i-text ang ULIT kung mali)\n\nAno naman ang iyong edad? (Hal. 24)`);
      return;
    }

    if (step === 4) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 3);
        await sendSms(phone, "I-text ulit ang iyong buong pangalan: ");
        return;
      }
      
      let value = convertWordToNumber(userText);
      if (value === null) {
        try { value = parseInt(userText); } catch { value = null; }
      }
      if (value === null) {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisulat ang tamang edad (hal. 24): ");
        }
        return;
      }
      
      await db.updateBioByPhone(phone, "age", value.toString(), 5);
      
      const fullName = getFullName(fullUser);
      await sendSms(phone, `${fullName}, ${value} (i-text ang ULIT kung mali)\n\nAno naman ang iyong kasarian? (Lalake/Babae)`);
      return;
    }

    if (step === 5) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 4);
        await sendSms(phone, "Paki-text muli ang iyong edad: ");
        return;
      }
      
      await db.updateBioByPhone(phone, "sex", userText, 6);
      await db.createProfessionalRecord(deped_id);
      await db.updateStep(deped_id, 7);
      
      const fullName = getFullName(fullUser);
      await sendSms(phone, `${fullName}, ${fullUser.age} taon (i-text ang ULIT kung mali)\n\nIlagay ang tagal ng pagtuturo (Hal. 10): `);
      return;
    }

    if (step === 7) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 5);
        await sendSms(phone, "Paki-text muli ang iyong kasarian: ");
        return;
      }
      
      const value = parseYears(userText);
      if (value === null) {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisagot ang tagal ng pagtuturo (hal. 10 years): ");
        }
        return;
      }
      
      await db.updateProfessional(deped_id, "years_experience", value);
      await db.updateStep(deped_id, 8);
      
      await sendSms(phone, `Tagal ng pagtuturo: ${value} years (i-text ang ULIT kung mali)\n\nAno naman ang iyong posisyon?`);
      return;
    }

    if (step === 8) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 7);
        await sendSms(phone, "Paki-text muli ang tagal ng pagtuturo: ");
        return;
      }
      
      await db.updateProfessional(deped_id, "role_position", userText);
      await db.updateStep(deped_id, 9);
      
      await sendSms(phone, `Posisyon: ${userText} (i-text ang ULIT kung mali)\n\nAno naman ang iyong espesyalisasyon?`);
      return;
    }

    if (step === 9) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 8);
        await sendSms(phone, "Paki-text muli ang posisyon: ");
        return;
      }
      
      await db.updateProfessional(deped_id, "specialization", userText);
      await db.updateStep(deped_id, 10);
      
      await sendSms(phone, `Espesyalisasyon: ${userText} (i-text ang ULIT kung mali)\n\nMay access ka ba sa internet? (Yes/No)`);
      return;
    }

    if (step === 10) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 9);
        await sendSms(phone, "Paki-text muli ang espesyalisasyon: ");
        return;
      }
      
      let isInternet = 0;
      
      if (["yes", "oo", "yes po"].includes(lower)) {
        isInternet = 1;
      } else if (!["no", "hindi"].includes(lower)) {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisagot lang ng Yes o No: ");
        }
        return;
      }
      
      await db.updateProfessional(deped_id, "is_internet_access", isInternet);
      await db.updateStep(deped_id, 11);
      
      await sendSms(phone, "Internet: " + (isInternet ? "Yes" : "No") + " (i-text ang ULIT kung mali)\n\nGaano karami ang iyong device? (Hal. 2)");
      return;
    }

    if (step === 11) {
      if (lower === "ulit") {
        await db.updateStep(deped_id, 10);
        await sendSms(phone, "Paki-text muli ang internet access: ");
        return;
      }
      
      let value = convertWordToNumber(userText);
      if (value === null) {
        try { value = parseInt(userText); } catch { value = null; }
      }
      if (value === null) {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisagot ang dami ng device (hal. 2): ");
        }
        return;
      }
      
      await db.updateProfessional(deped_id, "device_count", value);
      await db.updateStep(deped_id, 12);
      
      const confirmMsg = DISPLAY_MESSAGES.CONFIRM.replace("{devices}", value.toString());
      await sendSms(phone, confirmMsg);
      return;
    }

    if (step === 12) {
      console.log(`[STEP 12] Received: ${userText}, lower: ${lower}`);
      if (lower === "go") {
        await db.updateStep(deped_id, 13);
        
        const summary = DISPLAY_MESSAGES.SUMMARY
          .replace("{deped_id}", deped_id)
          .replace("{full_name}", getFullName(fullUser))
          .replace("{age}", fullUser.age || "?")
          .replace("{years}", professionalData?.years_experience?.toString() || "?")
          .replace("{position}", professionalData?.role_position || "?")
          .replace("{specialization}", professionalData?.specialization || "?")
          .replace("{devices}", professionalData?.device_count?.toString() || "?");
        
        await sendSms(phone, summary);
        return;
      }
      
      await sendSms(phone, "Paki-text lang ang GO: ");
      return;
    }

    if (step === 13) {
      if (lower === "go" || lower === "go go go") {
        await db.updateStep(deped_id, 14);
        await sendSms(phone, DISPLAY_MESSAGES.SUCCESS);
        return;
      }
      
      await sendSms(phone, "Paki-text lang ang GO GO GO: ");
      return;
    }

    console.log(`[DEBUG] No matching step, step: ${step}, errors: ${errors}`);
    if (errors < 1) {
      await db.incrementError(deped_id);
      await sendSms(phone, "Paki-text lang ng tamang sagot: ");
    }
  } catch (error) {
    console.error("[processSurvey Error]", error);
    throw error;
  }
}