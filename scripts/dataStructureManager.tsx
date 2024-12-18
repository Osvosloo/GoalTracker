import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyRecord, SectionData, ExistingData } from "../app/types";
import { getDailyRecordByDate } from "./getFromStorage";
import cloneDeep from "lodash/cloneDeep";

let existingData: ExistingData | null = null;

export const STORAGE_KEYS = {
  DAILY_RECORDS: "dailyRecords",
  DAILY_COMPLETION: "dailyCompletion",
  EXISTING_DATA: "existingData",
};

// export const loadExistingData = async () => {
//   try {
//     const data = await AsyncStorage.getItem("existingData");
//     if (data) {
//       existingData = JSON.parse(data);
//       console.log(`loading existing data: ${existingData}`);
//     }
//   } catch (error) {
//     console.error("Failed to load existing data:", error);
//   }
// };

export const updateExistingData = async () => {
  const today = new Date().toISOString().split("T")[0];
  const dailyRecord = await getDailyRecordByDate(today);
  if (dailyRecord) {
    existingData = { sections: mapSections(dailyRecord.sections) };
  }
  saveExistingData(existingData);
};

// Save existing data to AsyncStorage
const saveExistingData = async (existingData: ExistingData | null) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.EXISTING_DATA,
      JSON.stringify(existingData)
    );
    console.log(`updating existing record: ${JSON.stringify(existingData)}`);
  } catch (error) {
    console.error("Failed to save existing data:", error);
  }
};

export const cleanupOldRecords = async () => {
  try {
    const recordsData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
    let dailyRecords: DailyRecord[] = recordsData
      ? JSON.parse(recordsData)
      : [];

    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - 7); // 7 days ago

    const cleanedRecords = dailyRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= cutoffDate; // Keep records within the last 7 days
    });

    // Save updated records
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_RECORDS,
      JSON.stringify(cleanedRecords)
    );
    // console.log(
    //   "Cleaned up old records, keeping only the last 7 days:",
    //   cleanedRecords
    // );
  } catch (error) {
    console.error("Failed to clean up old records:", error);
  }
};

// Populate missing daily records
export const populateMissingDailyRecords = async () => {
  try {
    const recordsData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
    let dailyRecords: DailyRecord[] = recordsData
      ? JSON.parse(recordsData)
      : [];

    const today = new Date();
    const lastRecordDate =
      dailyRecords.length > 0
        ? new Date(
            Math.max(
              ...dailyRecords.map((record) => new Date(record.date).getTime())
            )
          )
        : null; // No previous records

    // If there are no previous records, create today's record
    if (!lastRecordDate) {
      dailyRecords.push(
        createRecordForDate(today, existingData?.sections || [])
      );
    } else {
      const startDate = new Date(lastRecordDate);
      startDate.setDate(startDate.getDate() + 1); // Start from the day after the last record

      // Create records for each missed day
      while (startDate <= today) {
        const formattedDate = startDate.toISOString().split("T")[0];
        if (!dailyRecords.find((record) => record.date === formattedDate)) {
          console.log(`Creating record for missing date: ${formattedDate}`);
          dailyRecords.push(
            createRecordForDate(startDate, existingData?.sections || [])
          );
        }
        startDate.setDate(startDate.getDate() + 1); // Move to the next day
      }
    }

    // Save updated records
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_RECORDS,
      JSON.stringify(dailyRecords)
    );
    console.log("Daily records updated and saved:", dailyRecords);
  } catch (error) {
    console.error("Failed to populate missing daily records:", error);
  }
};

// Helper function to create a record for a specific date
const createRecordForDate = (
  date: Date,
  sections: SectionData[]
): DailyRecord => {
  const formattedDate = date.toISOString().split("T")[0];
  return {
    date: formattedDate,
    sections: mapSections(sections, false),
  };
};

// Function to save daily completion data
export const saveDailyCompletion = async (sections: SectionData[]) => {
  try {
    const completionData = {
      date: new Date().toISOString().split("T")[0],
      sections: sections.map((section) => ({
        title: section.title,
        goals: section.goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          score: goal.score,
          completed: goal.completed,
          sectionTitle: section.title,
          creationDate: goal.creationDate,
        })),
      })),
    };

    // Save to daily completion
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_COMPLETION,
      JSON.stringify(completionData)
    );
    console.log("Daily completion data saved:", completionData);
  } catch (error) {
    console.error("Failed to save daily completion data:", error);
  }
};

// export const deepCopySections = (sections: SectionData[]): SectionData[] => {
//   return sections.map((section) => ({
//     ...section,
//     goals: [...section.goals],
//   }));
// };

export const deepCopySections = (sections: SectionData[]): SectionData[] => {
  return cloneDeep(sections);
};

const mapSections = (
  sections: SectionData[],
  completed: boolean = false
): SectionData[] => {
  return sections.map((section) => ({
    ...section,
    goals: section.goals.map((goal) => ({
      ...goal,
      completed,
    })),
  }));
};
