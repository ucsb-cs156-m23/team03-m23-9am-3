import React from 'react';
import RecRequestTable from "main/components/RecommendationRequest/RecRequestTable";
import { recRequestFixtures } from 'fixtures/recRequestFixtures';
import { currentUserFixtures } from 'fixtures/currentUserFixtures';
import { rest } from "msw";

export default {
    title: 'components/RecommendationRequest/RecommendationRequestTable',
    component: RecRequestTable
};

const Template = (args) => {
    return (
        <RecRequestTable {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    recrequests: []
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
    recrequests: recRequestFixtures.threeRecommendationRequest,
    currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
    recrequests: recRequestFixtures.threeRecommendationRequest,
    currentUser: currentUserFixtures.adminUser,
}

ThreeItemsAdminUser.parameters = {
    msw: [
        rest.delete('/api/recommendationrequest', (req, res, ctx) => {
            window.alert("DELETE: " + JSON.stringify(req.url));
            return res(ctx.status(200),ctx.json({}));
        }),
    ]
};
