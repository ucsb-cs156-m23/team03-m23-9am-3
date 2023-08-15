import React from 'react';
import RecRequestForm from "main/components/RecommendationRequest/RecRequestForm"
import { recRequestFixtures } from 'fixtures/recRequestFixtures';

export default {
    title: 'components/RecommendationRequest/RecommendationRequestForm',
    component: RecRequestForm
};


const Template = (args) => {
    return (
        <RecRequestForm {...args} />
    )
};

export const Create = Template.bind({});

Create.args = {
    buttonLabel: "Create",
    submitAction: (data) => {
        console.log("Submit was clicked with data: ", data); 
        window.alert("Submit was clicked with data: " + JSON.stringify(data));
   }
};

export const Update = Template.bind({});

Update.args = {
    initialContents: recRequestFixtures.oneRecRequest,
    buttonLabel: "Update",
    submitAction: (data) => {
        console.log("Submit was clicked with data: ", data); 
        window.alert("Submit was clicked with data: " + JSON.stringify(data));
   }
};