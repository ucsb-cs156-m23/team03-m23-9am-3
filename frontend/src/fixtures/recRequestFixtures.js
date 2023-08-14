const recRequestFixtures = {
    oneRecRequest: {
        "id": 1,
        "requesterEmail" : "jennifer.lopez@students.university.edu",
        "professorEmail" : "prof.anderson@university.edu",
        "explanation" : "Request for a letter of recommendation for my graduate school application to UCSB.",
        "dateRequested": "2022-03-15T12:00:00",
        "dateNeeded" : "2022-04-01T12:00:00",
        "done" : "true"
    },  
    threeRecRequest: [
        {
            "id": 1,
            "requesterEmail" : "jennifer.lopez@students.university.edu",
            "professorEmail" : "prof.anderson@university.edu",
            "explanation" : "Request for a letter of recommendation for my graduate school application to UCSB.",
            "dateRequested": "2022-03-15T12:00:000",
            "dateNeeded" : "2022-04-01T12:00:00",
            "done" : "true"
        },
        {
            "id": 2,
            "requesterEmail" : "michael.jordan@workplace.net",
            "professorEmail" : "dr.williams@college.org",
            "explanation" : "Need a recommendation letter for a summer internship at XYZ Corp.",
            "dateRequested": "2022-06-01T12:00:00",
            "dateNeeded" : "2022-06-15T12:00:00",
            "done" : "false"
        },
        {
            "id": 3,
            "requesterEmail" : "sophia.wang@students.college.org",
            "professorEmail" : "jane.smith@faculty.school.edu",
            "explanation" : "Requesting a recommendation for a scholarship application due in September.",
            "dateRequested": "2022-08-20T12:00:00",
            "dateNeeded" : "2022-09-05T12:00:000",
            "done" : "true"
        }
    ]
};


export { recRequestFixtures }; 