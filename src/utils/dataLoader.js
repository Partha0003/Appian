import Papa from 'papaparse';

export const loadData = async () => {
  try {
    // Load input state data
    const inputResponse = await fetch('/operations_input_state_FINAL.csv');
    const inputText = await inputResponse.text();
    const inputData = Papa.parse(inputText, { header: true, skipEmptyLines: true });

    // Load insights data
    const insightsResponse = await fetch('/operations_decision_insights_FINAL.csv');
    const insightsText = await insightsResponse.text();
    const insightsData = Papa.parse(insightsText, { header: true, skipEmptyLines: true });

    // Join data on Case_ID
    const joinedData = inputData.data.map(inputRow => {
      const insightRow = insightsData.data.find(insight => insight.Case_ID === inputRow.Case_ID);
      if (!insightRow) return null; // Skip if no matching insight
      
      return {
        ...inputRow,
        // Preserve insight fields
        Risk_Level: insightRow.Risk_Level,
        Operational_Bottleneck: insightRow.Operational_Bottleneck,
        Recommended_Action: insightRow.Recommended_Action,
        // Convert numeric fields from input
        Complexity_Score: parseFloat(inputRow.Complexity_Score) || 0,
        SLA_Limit_Mins: parseInt(inputRow.SLA_Limit_Mins) || 0,
        Queue_Depth: parseInt(inputRow.Queue_Depth) || 0,
        Active_Agents: parseInt(inputRow.Active_Agents) || 0,
        Avg_Handle_Time_Mins: parseInt(inputRow.Avg_Handle_Time_Mins) || 0,
        Load_Index: parseFloat(inputRow.Load_Index) || 0,
        Arrival_Hour: parseInt(inputRow.Arrival_Hour) || 0,
        Day_Of_Week: parseInt(inputRow.Day_Of_Week) || 0,
        // Convert numeric fields from insights
        Predicted_SLA_Risk: parseFloat((insightRow['Predicted_SLA_Risk_%'] || insightRow.Predicted_SLA_Risk_ || '0').toString().replace('%', '')) || 0,
        Estimated_Time_To_Breach_Mins: (insightRow.Estimated_Time_To_Breach_Mins === 'NA' || !insightRow.Estimated_Time_To_Breach_Mins)
          ? null 
          : parseInt(insightRow.Estimated_Time_To_Breach_Mins) || null,
        Expected_Risk_After_Action: parseFloat((insightRow['Expected_Risk_After_Action_%'] || insightRow.Expected_Risk_After_Action_ || '0').toString().replace('%', '')) || 0,
      };
    }).filter(row => row && row.Case_ID); // Remove any rows without Case_ID or insight data

    return joinedData;
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};

