import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import RecRequestEditPage from "main/pages/RecommendationRequest/RecRequestEditPage";

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
            id: 17
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("RecRequestEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/recommendationrequest", { params: { id: 17 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <RecRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit Recommendation Request");
            expect(screen.queryByTestId("requestorEmail")).not.toBeInTheDocument();
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
            axiosMock.onGet("/api/recommendationrequest", { params: { id: 17 } }).reply(200, {
                id: 17,
                requesterEmail: 'sophia.wang@students.college.org',
                professorEmail: "jane.smith@faculty.school.edu",
                explanation: "Requesting a recommendation for a scholarship application due in September.",
                dateRequested: "2022-08-20T12:00",
                dateNeeded: "2022-09-05T12:00",
                done: 'true'
            });
            axiosMock.onPut('/api/recommendationrequest').reply(200, {
                id: 17,
                requesterEmail: "michael.jordan@workplace.net",
                professorEmail: "dr.williams@college.org",
                explanation: "Need a recommendation letter for a summer internship at XYZ Corp.",
                dateRequested: "2022-06-01T12:00",
                dateNeeded: "2022-06-15T12:00",
                done: 'false'
            });
        });

        const queryClient = new QueryClient();
        test("renders without crasing", () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <RecRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            )
        });
    
        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <RecRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("RecRequestForm-id");

            const idField = screen.getByTestId("RecRequestForm-id");
            const emailField = screen.getByTestId("RecRequestForm-requesterEmail");
            const profField = screen.getByTestId("RecRequestForm-professorEmail");
            const descriptionField = screen.getByTestId("RecRequestForm-explanation");
            const dateRequestedField = screen.getByTestId("RecRequestForm-dateRequested");
            const dateNeededField = screen.getByTestId("RecRequestForm-dateNeeded");
            const doneField = screen.getByTestId("RecRequestForm-done");
            const submitButton = screen.getByTestId("RecRequestForm-submit");

            expect(idField).toHaveValue("17");
            expect(emailField).toHaveValue("sophia.wang@students.college.org");
            expect(profField).toHaveValue("jane.smith@faculty.school.edu");
            expect(descriptionField).toHaveValue("Requesting a recommendation for a scholarship application due in September.");
            expect(dateRequestedField).toHaveValue("2022-08-20T12:00");
            expect(dateNeededField).toHaveValue("2022-09-05T12:00");
            expect(doneField).toHaveValue("true");
            expect(submitButton).toBeInTheDocument();
        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <RecRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("RecRequestForm-id");

            const idField = screen.getByTestId("RecRequestForm-id");
            const emailField = screen.getByTestId("RecRequestForm-requesterEmail");
            const profField = screen.getByTestId("RecRequestForm-professorEmail");
            const descriptionField = screen.getByTestId("RecRequestForm-explanation");
            const dateRequestedField = screen.getByTestId("RecRequestForm-dateRequested");
            const dateNeededField = screen.getByTestId("RecRequestForm-dateNeeded");
            const doneField = screen.getByTestId("RecRequestForm-done");
            const submitButton = screen.getByTestId("RecRequestForm-submit");

            expect(idField).toHaveValue("17");
            expect(emailField).toHaveValue("sophia.wang@students.college.org");
            expect(profField).toHaveValue("jane.smith@faculty.school.edu");
            expect(descriptionField).toHaveValue("Requesting a recommendation for a scholarship application due in September.");
            expect(dateRequestedField).toHaveValue("2022-08-20T12:00");
            expect(dateNeededField).toHaveValue("2022-09-05T12:00");
            expect(doneField).toHaveValue("true");
            expect(submitButton).toBeInTheDocument();

            fireEvent.change(emailField, { target: { value: "michael.jordan@workplace.net" } });
            fireEvent.change(profField, { target: { value: "dr.williams@college.org" } });
            fireEvent.change(descriptionField, { target: { value: "Need a recommendation letter for a summer internship at XYZ Corp." } });
            fireEvent.change(dateRequestedField, { target: { value: "2022-06-01T12:00" } });
            fireEvent.change(dateNeededField, { target: { value: "2022-06-15T12:00" } });
            fireEvent.change(doneField, { target: { value: "false" } });
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toHaveBeenCalledWith("Recommendation Request Updated - id: 17 requesterEmail: michael.jordan@workplace.net professorEmail: dr.williams@college.org explanation: Need a recommendation letter for a summer internship at XYZ Corp. dateRequested: 2022-06-01T12:00 dateNeeded: 2022-06-15T12:00 done: false");
            expect(mockNavigate).toBeCalledWith( {"to": "/recommendationrequest"} );

            expect(axiosMock.history.put.length).toBe(1);
            expect(axiosMock.history.put[0].params).toEqual({ id : 17 });
            expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
                requesterEmail: "michael.jordan@workplace.net",
                professorEmail: "dr.williams@college.org",
                explanation: "Need a recommendation letter for a summer internship at XYZ Corp.",
                dateRequested: "2022-06-01T12:00",
                dateNeeded: "2022-06-15T12:00",
                done: 'false'
            });
        });
    });
});