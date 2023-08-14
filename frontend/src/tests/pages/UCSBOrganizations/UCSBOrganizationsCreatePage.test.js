import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationsCreatePage from "main/pages/UCSBOrganizations/UCSBOrganizationsCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("UCSBOrganizationsCreatePage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    test("renders without crashing", () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <UCSBOrganizationsCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("when submit, makes request to backend and redirects to /ucsborganizations", async () => {

        const queryClient = new QueryClient();
        const organization = {
            orgCode: "SKY",
            orgTranslationShort: "Skydiving Club",
            orgTranslation: "Skydiving Club at UCSB",
            inactive: false
        };

        axiosMock.onPost("/api/ucsborganizations/post").reply(202, organization);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <UCSBOrganizationsCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId("UCSBOrganizationsForm-orgCode")).toBeInTheDocument();
        });

        const orgCodeField = screen.getByTestId("UCSBOrganizationsForm-orgCode");
        const orgTranslationShortField = screen.getByTestId("UCSBOrganizationsForm-orgTranslationShort");
        const orgTranslationField = screen.getByTestId("UCSBOrganizationsForm-orgTranslation");
        const inactiveField = screen.getByTestId("UCSBOrganizationsForm-inactive");
        const createButton = screen.getByTestId("UCSBOrganizationsForm-submit");
        expect(createButton).toBeInTheDocument();

        fireEvent.change(orgCodeField, { target: { value: 'SKY' } });
        fireEvent.change(orgTranslationShortField, { target: { value: 'Skydiving Club' } });
        fireEvent.change(orgTranslationField, { target: { value: 'Skydiving Club at UCSB' } });
        fireEvent.change(inactiveField, { target: { value: false } });
        fireEvent.click(createButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].params).toEqual(
            {
                "orgCode": "SKY",
                "orgTranslationShort": "Skydiving Club",
                "orgTranslation": "Skydiving Club at UCSB",
                "inactive": false
            });
        
        expect(mockToast).toBeCalledWith("New UCSB Organization Created - orgCode: SKY");
        expect(mockNavigate).toBeCalledWith({ "to": "/ucsborganizations" });
    });

});