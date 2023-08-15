const helpRequestFixtures = {
    onehelpRequest:
    [
      {
       "id": 1,
        "requesterEmail": "johnny421@ucsb.edu",
        "teamId": "9am team03", 
        "tableOrBreakoutroom": "table",
        "requestTime": "2023-08-02T12:00:00",
        "explanation": "wrong code",
        "solved":"true"
      }
    ],

    threehelpRequest:
    [
        {
            "id": 2,
             "requesterEmail": "kyou@ucsb.edu",
             "tableOrBreakoutroom": "table",
             "requestTime": "2023-01-02T12:00:00", 
             "explanation": "don't understand",    
             "solved":"true"  
        },

        {
            "id": 3,
             "requesterEmail": "lawrence_wang@ucsb.edu",
             "tableOrBreakoutroom": "breakoutroom",
             "requestTime": "2023-05-23T12:00:00",    
             "explanation": "extreme pain!",
             "solved":"false"
        },

        {
            "id": 4,
             "requesterEmail": "wenxuanxu@ucsb.edu",
             "tableOrBreakoutroom": "table",
             "requestTime": "2023-10-31T12:00:00",    
             "explanation": "I have no clue.",  
             "solved":"false"   
        },
        
    ]
};

export { helpRequestFixtures };