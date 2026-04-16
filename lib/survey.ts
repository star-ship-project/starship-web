const DISPLAY_MESSAGES = {
  1: "Good Day! This is the STAR's data collection system!",
  2: "Identity confirmed!"
};

const SURVEY_QUESTIONS = {
  1: "Ilagay ang DepEd ID: ",
  2: "Ilagay ang School ID (isulat ang N/A kung wala):  ",
  3: "Buong Pangalan [Apilyido],[Unang Pangalan],[Gitnang Pangalan],[Suffix/Hulapi]",
  4: "Edad (Ex: 30): ",
  5: "Kasarian (Ex: Lalake): ",
  6: "Tagal ng Pagtuturo: ",
  7: "Posisyon: ",
  8: "Ispesyalisasiyon: ",
  9: "May access ka ba sa internet?: ",
  10: "Gaano karami ang iyong device?: "
};

async function sendSms(to: string, message: string) {
  const apiKey = process.env.HTTPSMS_API_KEY;
  const fromNumber = process.env.FROM_NUMBER;
  
  // Ignore messages sent from the bot's own number
  if (to === fromNumber) {
    console.log("[SMS] Skipping - same as FROM_NUMBER");
    return;
  }
  
  if (!apiKey || !fromNumber) {
    console.log("[SMS] No API key configured, skipping send");
    return;
  }

  try {
    await fetch("https://api.httpsms.com/v1/messages/send", {
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
    console.log(`[SMS] Sent to ${to}`);
  } catch (error) {
    console.error("[SMS Error]", error);
  }
}

function convertWordToNumber(text: string): number | null {
  const wordMap: Record<string, number> = {
    "isa": 1, "dalawa": 2, "tatlo": 3, "apat": 4, "lima": 5,
    "anim": 6, "pito": 7, "walo": 8, "siam": 9, "sampu": 10,
    " labing-isa": 11, "labindalawa": 12, "labintatlo": 13, "labing-apat": 14, "labinlima": 15,
    "labing-anim": 16, "labing-pito": 17, "labing-walo": 18, "labingsiam": 19, "dalawampu": 20,
    "tatlumpu": 30, "apatnapu": 40, "limampu": 50, "animnapu": 60, "pitumpu": 70, "walumpu": 80, "siyamnapu": 90,
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
    "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90
  };
  
  const lower = text.toLowerCase().trim();
  return wordMap[lower] ?? null;
}

function parseYears(text: string): number | null {
  const cleaned = text.toLowerCase().replace(/(taon|years|yr)/g, "").trim();
  
  // First try word to number
  const wordResult = convertWordToNumber(cleaned);
  if (wordResult !== null) return wordResult;
  
  // Then try parsing as number
  const num = parseInt(cleaned, 10);
  if (!isNaN(num) && num > 0 && num < 100) return num;
  
  return null;
}

export async function processSurvey(phone: string, text: string) {
  try {
    const db = await import("@/lib/db");
    
    const userRow = await db.getUserByPhone(phone);
    
    if (!userRow) {
      await db.createUser(phone);
      console.log(`[DB] New user created for phone ${phone}`);
      await sendSms(phone, DISPLAY_MESSAGES[1]);
      await sendSms(phone, SURVEY_QUESTIONS[1]);
      return;
    }

    const fullUser = await db.getUserByPhone(phone);
    if (!fullUser) return;
    
    const step = fullUser.step || 0;
    const errors = fullUser.errors || 0;
    const deped_id = fullUser.deped_id;

    if (step === 11) {
      await sendSms(phone, "You have already completed the survey. Thank you!");
      await db.updateStep(deped_id, 12);
      return;
    }

    if (step >= 12) {
      console.log(`[SILENT DROP] Ignored post-completion message from ${phone}`);
      return;
    }

    const userText = text.trim();

    if (step === 1) {
      await db.updateBioByPhone(phone, "deped_id", userText, 2);
      console.log(`[DB] Saved deped_id = ${userText} for ${phone}`);
      await sendSms(phone, SURVEY_QUESTIONS[2]);
      return;
    }

    if (step === 3) {
      const parts = userText.split(",").map(p => p.trim());
      if (parts[0]) await db.updateBioByPhone(phone, "last_name", parts[0], 4);
      if (parts[1]) await db.updateBioByPhone(phone, "first_name", parts[1], 4);
      if (parts[2]) await db.updateBioByPhone(phone, "middle_name", parts[2], 4);
      if (parts[3]) await db.updateBioByPhone(phone, "suffix_name", parts[3], 4);
      console.log(`[DB] Saved name for ${deped_id}: ${userText}`);
      await sendSms(phone, SURVEY_QUESTIONS[4]);
      return;
    }

    if (step === 4) {
      let value = convertWordToNumber(userText);
      if (value === null) {
        try { value = parseInt(userText); } catch { value = null; }
      }
      if (value === null) {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisulat ang tamang edad (hal. 30 o thirty): ");
        }
        return;
      }
      await db.updateBioByPhone(phone, "age", value.toString(), 5);
      console.log(`[DB] Saved age = ${value} for ${deped_id}`);
      await sendSms(phone, SURVEY_QUESTIONS[5]);
      return;
    }

    if (step === 6) {
      const value = parseYears(userText);
      if (value === null) {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisagot ang tagal ng pagtuturo (hal. 10 years o 10 taon): ");
        }
        return;
      }
      await db.updateProfessional(deped_id, "years_experience", value);
      await db.updateStep(deped_id, 7);
      console.log(`[DB] Saved years_experience = ${value} for ${deped_id}`);
      await sendSms(phone, SURVEY_QUESTIONS[7]);
      return;
    }

    if (step === 10) {
      let value = convertWordToNumber(userText);
      if (value === null) {
        try { value = parseInt(userText); } catch { value = null; }
      }
      if (value === null) {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisagot ang dami ng device (hal. 2 o dalawa): ");
        }
        return;
      }
      await db.updateProfessional(deped_id, "device_count", value);
      await db.updateStep(deped_id, 11);
      console.log(`[DB] Saved device_count = ${value} for ${deped_id}`);
      await sendSms(phone, "Salamat! Successfully completed the survey.");
      return;
    }

    if (step === 2) {
      const userInput = userText.trim().toLowerCase();
      let schoolId: string | null = userText;
      
      // Check if it's N/A or invalid school_id - set to null
      if (userInput === "n/a" || userInput === "na" || userInput === "n") {
        schoolId = null;
      } else {
        // Validate school_id exists in database
        const validSchools = await db.getAllSchools();
        const validIds = validSchools.map((s: any) => s.school_id);
        if (!validIds.includes(userText)) {
          schoolId = null;
          console.log(`[DB] Invalid school_id, setting to null: ${userText}`);
        }
      }
      
      await db.updateBioByPhone(phone, "school_id", schoolId, 3);
      console.log(`[DB] Saved school_id = ${schoolId} for ${deped_id}`);
      await sendSms(phone, SURVEY_QUESTIONS[3]);
      return;
    }

    if (step === 5) {
      await db.updateBioByPhone(phone, "sex", userText, 6);
      console.log(`[DB] Saved sex = ${userText} for ${deped_id}`);
      await db.createProfessionalRecord(deped_id);
      await sendSms(phone, SURVEY_QUESTIONS[6]);
      return;
    }

    if (step === 7) {
      await db.updateProfessional(deped_id, "role_position", userText);
      await db.updateStep(deped_id, 8);
      console.log(`[DB] Saved role_position = ${userText} for ${deped_id}`);
      await sendSms(phone, SURVEY_QUESTIONS[8]);
      return;
    }

    if (step === 8) {
      await db.updateProfessional(deped_id, "specialization", userText);
      await db.updateStep(deped_id, 9);
      console.log(`[DB] Saved specialization = ${userText} for ${deped_id}`);
      await sendSms(phone, SURVEY_QUESTIONS[9]);
      return;
    }

    if (step === 9) {
      const lower = userText.toLowerCase();
      let isInternet: number;
      
      if (["yes", "oo", "oo naman", "yes po"].includes(lower)) {
        isInternet = 1;
      } else if (["no", "hindi", "walang internet"].includes(lower)) {
        isInternet = 0;
      } else {
        if (errors < 1) {
          await db.incrementError(deped_id);
          await sendSms(phone, "Pakisagot lang ng 'yes' o 'no': ");
        }
        return;
      }
      await db.updateProfessional(deped_id, "is_internet_access", isInternet);
      await db.updateStep(deped_id, 10);
      console.log(`[DB] Saved is_internet_access = ${isInternet} for ${deped_id}`);
      await sendSms(phone, SURVEY_QUESTIONS[10]);
      return;
    }

    if (errors < 1) {
      await db.incrementError(deped_id);
      await sendSms(phone, `Invalid input. Please try again: ${SURVEY_QUESTIONS[step as keyof typeof SURVEY_QUESTIONS]}`);
    }
  } catch (error) {
    console.error("[processSurvey Error]", error);
    throw error;
  }
}