import React from 'react';
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recRequestFixtures } from "fixtures/recRequestFixtures";
import { rest } from "msw";

import RecRequestEditPage from "main/pages/RecommendationRequest/RecRequestEditPage";

export default {
    title: 'pages/RecommendationRequest/RecRequestEditPage',
    component: RecRequestEditPage
};

const Template = () => <RecRequestEditPage storybook={true}/>;

export const Default = Template.bind({});
Default.parameters = {
    msw: [
        rest.get('/api/currentUser', (_req, res, ctx) => {
            return res( ctx.json(apiCurrentUserFixtures.userOnly));
        }),
        rest.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        rest.get('/api/recommendationrequest', (_req, res, ctx) => {
            return res(ctx.json(recRequestFixtures.threeRecommendationRequest[0]));
        }),
        rest.put('/api/recommendationrequest', async (req, res, ctx) => {
            var reqBody = await req.text();
            window.alert("PUT: " + req.url + " and body: " + reqBody);
            return res(ctx.status(200),ctx.json({}));
        }),
    ],
}