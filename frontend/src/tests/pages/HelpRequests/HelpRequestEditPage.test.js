import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import HelpRequestEditPage from "main/pages/HelpRequests/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: "true",
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: "true",
        ...originalModule,
        useParams: () => ({
            id: 17
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("HelpRequestEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <HelpRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit HelpRequest");
            expect(screen.queryByTestId("HelpRequest-requesterEmail")).not.toBeInTheDocument();
            restoreConsole();
        });
    });

    describe("tests where backend is working normally", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
                id: 17,
                requesterEmail: "testeremail01@ucsb.edu",
                teamId: "01",
                tableOrBreakoutRoom: "table",
                requestTime: "2023-10-22T07:00",
                explanation: "Need help asap",
                solved: "false"
            });
            axiosMock.onPut('/api/helprequests').reply(200, {
                id: "17",
                requesterEmail: "testeremail02@ucsb.edu",
                teamId: "02",
                tableOrBreakoutRoom: "breakoutroom",
                requestTime: "2023-08-07T12:00",
                explanation: "Don't need help",
                solved: "true"
            });
        });

        const queryClient = new QueryClient();

        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <HelpRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("HelpRequestForm-id");

            const idField = screen.getByTestId("HelpRequestForm-id");
            const emailField = screen.getByTestId("HelpRequestForm-requesterEmail");
            const teamField = screen.getByTestId("HelpRequestForm-teamId");
            const tableField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
            const timeField = screen.getByTestId("HelpRequestForm-requestTime");
            const explanationField = screen.getByTestId("HelpRequestForm-explanation");
            const solvedField = screen.getByTestId("HelpRequestForm-solved");
            const submitButton = screen.getByTestId("HelpRequestForm-submit");

            expect(idField).toBeInTheDocument();
            expect(idField).toHaveValue("17");
            expect(emailField).toBeInTheDocument();
            expect(emailField).toHaveValue("testeremail01@ucsb.edu");
            expect(teamField).toBeInTheDocument();
            expect(teamField).toHaveValue("01");
            expect(tableField).toBeInTheDocument();
            expect(tableField).toHaveValue("table");
            expect(timeField).toBeInTheDocument();
            expect(timeField).toHaveValue("2023-10-22T07:00");
            expect(explanationField).toBeInTheDocument();
            expect(explanationField).toHaveValue("Need help asap");
            expect(solvedField).toBeInTheDocument();
            expect(solvedField).toHaveValue("false");

            expect(submitButton).toHaveTextContent("Update");

            fireEvent.change(emailField, { target: { value: 'testeremail02@ucsb.edu' } });
            fireEvent.change(teamField, { target: { value: '02' } });
            fireEvent.change(tableField, { target: { value: 'breakoutroom' } });
            fireEvent.change(timeField, { target: { value: '2023-08-07T12:00' } });
            fireEvent.change(explanationField, { target: { value: "Don't need help" } });
            fireEvent.change(solvedField, { target: { value: "true" } });
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Help Request Updated - id: 17 requesterEmail: testeremail02@ucsb.edu");

            expect(mockNavigate).toBeCalledWith({ "to": "/helpRequest" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                requesterEmail: "testeremail02@ucsb.edu",
                teamId: "02",
                tableOrBreakoutRoom: "breakoutroom",
                requestTime: "2023-08-07T12:00",
                explanation: "Don't need help",
                solved: "true"
            })); // posted object


        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <HelpRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("HelpRequestForm-id");

            const idField = screen.getByTestId("HelpRequestForm-id");
            const emailField = screen.getByTestId("HelpRequestForm-requesterEmail");
            const teamField = screen.getByTestId("HelpRequestForm-teamId");
            const tableField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
            const timeField = screen.getByTestId("HelpRequestForm-requestTime");
            const explanationField = screen.getByTestId("HelpRequestForm-explanation");
            const solvedField = screen.getByTestId("HelpRequestForm-solved");
            const submitButton = screen.getByTestId("HelpRequestForm-submit");

            expect(idField).toHaveValue("17");
            expect(emailField).toHaveValue("testeremail01@ucsb.edu");
            expect(teamField).toHaveValue("01");
            expect(tableField).toHaveValue("table");
            expect(timeField).toHaveValue("2023-10-22T07:00");
            expect(explanationField).toHaveValue("Need help asap");
            expect(solvedField).toHaveValue("false");
            expect(submitButton).toBeInTheDocument();

            fireEvent.change(emailField, { target: { value: 'testeremail02@ucsb.edu' } });
            fireEvent.change(teamField, { target: { value: '02' } });
            fireEvent.change(tableField, { target: { value: 'breakoutroom' } });
            fireEvent.change(timeField, { target: { value: '2023-08-07T12:00' } });
            fireEvent.change(explanationField, { target: { value: "Don't need help" } });
            fireEvent.change(solvedField, { target: { value: "true" } });

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Help Request Updated - id: 17 requesterEmail: testeremail02@ucsb.edu");
            expect(mockNavigate).toBeCalledWith({ "to": "/helpRequest" });
        });


    });
});