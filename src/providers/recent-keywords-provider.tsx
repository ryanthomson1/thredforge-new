// src/providers/recent-keywords-provider.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { saveRecentKeyword, getRecentKeywords } from "@/lib/db";

export interface RecentKeyword {
  keyword: string;
  searchedAt: number;
}

interface RecentKeywordsContextProps {
  recentKeywords: RecentKeyword[];
  addRecentKeyword: (keyword: RecentKeyword) => void;
}

const RecentKeywordsContext = createContext<RecentKeywordsContextProps>({
  recentKeywords: [],
  addRecentKeyword: () => {},
});

export const useRecentKeywordsContext = () => {
  return useContext(RecentKeywordsContext);
};

interface RecentKeywordsProviderProps {
  children: ReactNode;
}

export const RecentKeywordsProvider: React.FC<RecentKeywordsProviderProps> = ({
  children,
}) => {
  const [recentKeywords, setRecentKeywords] = useState<RecentKeyword[]>([]);

  useEffect(() => {
    const fetchRecentKeywords = async () => {
      const keywords = await getRecentKeywords();
      setRecentKeywords(keywords);
    };

    fetchRecentKeywords();
  }, []);

  const addRecentKeyword = async (keyword: RecentKeyword) => {
    setRecentKeywords((prevKeywords) => {
      const isDuplicate = prevKeywords.some(
        (item) => item.keyword === keyword.keyword
      );

      if (isDuplicate) {
        return prevKeywords; // Return the original array without modifications
      }

      return [keyword, ...prevKeywords].slice(0, 10);
    });
    await saveRecentKeyword(keyword.keyword);
  };

  return (
    <RecentKeywordsContext.Provider
      value={{ recentKeywords, addRecentKeyword }}
    >
      {children}
    </RecentKeywordsContext.Provider>
  );
};
