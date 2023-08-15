import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecRequestCreatePage from "main/pages/RecommendationRequest/RecRequestCreatePage";
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

describe("RecRequestCreatePage tests", () => {

    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
        jest.clearAllMocks();
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    const queryClient = new QueryClient();
    test("renders without crashing", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RecRequestCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("on submit, makes request to backend, and redirects to /recommendationrequest", async () => {

        const queryClient = new QueryClient();
        const request = {
            id: 3,
            requesterEmail: "sophia.wang@students.college.org",
            professorEmail: "jane.smith@faculty.school.edu",
            explanation: "Requesting a recommendation for a scholarship application due in September.",
            dateRequested: "2022-08-20T12:00",
            dateNeeded: "2022-09-05T12:00",
            done: true
        };

        axiosMock.onPost("/api/recommendationrequest/post").reply(202, request);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RecRequestCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
        });

        const reqEmail = screen.getByLabelText("Requester Email");
        expect(reqEmail).toBeInTheDocument();

        const profEmail = screen.getByLabelText("Professor Email");
        expect(profEmail).toBeInTheDocument();

        const explanation = screen.getByLabelText("Explanation");
        expect(explanation).toBeInTheDocument();

        const dateRequested = screen.getByLabelText("Date Requested");
        expect(dateRequested).toBeInTheDocument();
        
        const dateNeeded = screen.getByLabelText("Date Needed");
        expect(dateNeeded).toBeInTheDocument();

        const doneInput = screen.getByLabelText("Is it done?");
        expect(doneInput).toBeInTheDocument();

        const createButton = screen.getByText("Create");
        expect(createButton).toBeInTheDocument();

        fireEvent.change(reqEmail, { target: { value: 'sophia.wang@students.college.org' } })
        fireEvent.change(profEmail, { target: { value: 'jane.smith@faculty.school.edu' } })
        fireEvent.change(explanation, { target: { value: 'Requesting a recommendation for a scholarship application due in September.' } })
        fireEvent.change(dateRequested, { target: { value: '2022-08-20T12:00' } })
        fireEvent.change(dateNeeded, { target: { value: '2022-09-05T12:00' } })
        fireEvent.change(doneInput, { target: { value: 'true' } })
        
        fireEvent.click(createButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].params).toEqual({
            requesterEmail: 'sophia.wang@students.college.org',
            professorEmail: "jane.smith@faculty.school.edu",
            explanation: "Requesting a recommendation for a scholarship application due in September.",
            dateRequested: "2022-08-20T12:00",
            dateNeeded: "2022-09-05T12:00",
            done: 'true'
        });

        // assert - check that the toast was called with the expected message
        expect(mockToast).toBeCalledWith("New recRequest Created - id: 3 requesterEmail: sophia.wang@students.college.org professorEmail: jane.smith@faculty.school.edu explanation: Requesting a recommendation for a scholarship application due in September. dateRequested: 2022-08-20T12:00 dateNeeded: 2022-09-05T12:00 done: true");
        expect(mockNavigate).toBeCalledWith({ "to": "/recommendationrequest" });
    });
});