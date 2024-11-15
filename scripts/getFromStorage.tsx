import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyRecord, SectionData } from "../app/types";

const STORAGE_KEYS = {
  DAILY_RECORDS: "dailyRecords",
  LAST_RESET_DATE: "lastResetDate",
};

export const getExistingData = async () => {
  try {
    const data = await AsyncStorage.getItem("existingData");
    if (data) {
      let existingData = JSON.parse(data);
      console.log(existingData);
    }
  } catch (error) {
    console.error("Failed to load existing data:", error);
  }
};

export const getDailyRecords = async (): Promise<DailyRecord[]> => {
  try {
    const recordsData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
    return recordsData ? JSON.parse(recordsData) : [];
  } catch (error) {
    console.error("Failed to get daily records:", error);
    return [];
  }
};

export const getDailyRecordByDate = async (
  date: string
): Promise<DailyRecord | null> => {
  const dailyRecords = await getDailyRecords();
  const dailyRecord = dailyRecords.find((record) => record.date === date);
  return dailyRecord || null;
};

export const getSectionsFromDailyRecord = async (
  date: string
): Promise<SectionData[] | null> => {
  const dailyRecord = await getDailyRecordByDate(date);
  return dailyRecord ? dailyRecord.sections : null;
};

export const getAllSections = async (date: string): Promise<SectionData[]> => {
  const sections = await getSectionsFromDailyRecord(date);
  return sections || [];
};

export const fetchWeeklyData = async (): Promise<DailyRecord[]> => {
  const allRecords = await getDailyRecords();
  const today = new Date();
  const pastWeekRecords = allRecords.filter((record) => {
    const recordDate = new Date(record.date);
    const diffTime = Math.abs(today.getTime() - recordDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 6; // Get records from the past 7 days (including today)
  });
  return pastWeekRecords;
};
