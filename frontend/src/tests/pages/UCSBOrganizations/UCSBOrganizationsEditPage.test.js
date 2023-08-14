import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import UCSBOrganizationsEditPage from "main/pages/UCSBOrganizations/UCSBOrganizationsEditPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "jest-mock-console";

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
        useParams: () => ({
            orgCode: "RAN"
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("UCSBOrganizationsEditPage tests", () => {

    describe("when the backend does not return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/ucsborganizations", { params: { orgCode: "RAN" } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {
            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <UCSBOrganizationsEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit UCSB Organization");
            expect(screen.queryByTestId("UCSBOrganizations-orgCode")).not.toBeInTheDocument();
            restoreConsole();
        });
    });

    describe("tests where backend is working normally", () => {

        const axiosMock = new AxiosMockAdapter(axios);
        const queryClient = new QueryClient();

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/ucsborganizations", { params: { orgCode: "RAN" } }).reply(200, {
                orgCode: "RAN",
                orgTranslationShort: "Random",
                orgTranslation: "Random Org",
                inactive: false
            });
            axiosMock.onPut('/api/ucsborganizations').reply(200, {
                orgCode: "RAN",
                orgTranslationShort: "Not Random",
                orgTranslation: "Not a Random Org",
                inactive: true
            });
        });

        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <UCSBOrganizationsEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("UCSBOrganizationsForm-orgCode");

            const orgCodeField = screen.getByTestId("UCSBOrganizationsForm-orgCode");
            const orgTranslationShortField = screen.getByTestId("UCSBOrganizationsForm-orgTranslationShort");
            const orgTranslationField = screen.getByTestId("UCSBOrganizationsForm-orgTranslation");
            const inactiveField = screen.getByTestId("UCSBOrganizationsForm-inactive");
            const submitButton = screen.getByTestId("UCSBOrganizationsForm-submit");

            expect(orgCodeField).toBeInTheDocument();
            expect(orgCodeField).toHaveValue("RAN");
            expect(orgTranslationShortField).toBeInTheDocument();
            expect(orgTranslationShortField).toHaveValue("Random");
            expect(orgTranslationField).toBeInTheDocument();
            expect(orgTranslationField).toHaveValue("Random Org");

            fireEvent.change(orgTranslationShortField, { target: { value: 'Not Random' } });
            fireEvent.change(orgTranslationField, { target: { value: 'Not a Random Org' } });
            fireEvent.change(inactiveField, { target: { value: true } });

            expect(submitButton).toHaveTextContent("Update");
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("UCSB Organization Updated - orgCode: RAN");

            expect(mockNavigate).toBeCalledWith({ "to": "/ucsborganizations" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ orgCode: "RAN" });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                orgTranslationShort: "Not Random",
                orgTranslation: "Not a Random Org",
                inactive: false
            })); // posted object


        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <UCSBOrganizationsEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("UCSBOrganizationsForm-orgCode");

            const orgCodeField = screen.getByTestId("UCSBOrganizationsForm-orgCode");
            const orgTranslationShortField = screen.getByTestId("UCSBOrganizationsForm-orgTranslationShort");
            const orgTranslationField = screen.getByTestId("UCSBOrganizationsForm-orgTranslation");
            const inactiveField = screen.getByTestId("UCSBOrganizationsForm-inactive");
            const submitButton = screen.getByTestId("UCSBOrganizationsForm-submit");

            expect(orgCodeField).toHaveValue("RAN");
            expect(orgTranslationShortField).toHaveValue("Random");
            expect(orgTranslationField).toHaveValue("Random Org");
            expect(submitButton).toBeInTheDocument();

            fireEvent.change(orgTranslationShortField, { target: { value: 'Not Random' } });
            fireEvent.change(orgTranslationField, { target: { value: 'Not a Random Org' } });
            fireEvent.change(inactiveField, { target: { value: true } });

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("UCSB Organization Updated - orgCode: RAN");
            expect(mockNavigate).toBeCalledWith({ "to": "/ucsborganizations" });
        });


    });

})