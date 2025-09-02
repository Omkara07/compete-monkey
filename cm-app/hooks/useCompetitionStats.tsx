"use client";

import { useEffect, useState } from "react";

export function useCompetitionStats() {
  const [competitionData, setCompetitionData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitionStats();
  }, []);

  const fetchCompetitionStats = async () => {
    try {
      const response = await fetch('/api/competitions');
      const data = await response.json();
      setCompetitionData(data.chartData);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching competition stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { competitionData, stats, loading, refetch: fetchCompetitionStats };
}