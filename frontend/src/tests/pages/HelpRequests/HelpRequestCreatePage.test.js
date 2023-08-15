import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequests/HelpRequestCreatePage";
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

describe("HelpRequestCreatePage tests", () => {

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
                    <HelpRequestCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("on submit, makes request to backend, and redirects to /requesterEmails", async () => {

        const queryClient = new QueryClient();
        const requesterEmail = {
            id: 3,
          requesterEmail: "testeremail@ucsb.edu",
          teamId: "03",
          tableOrBreakoutRoom: "BreakoutRoom",
          requestTime: "2023-08-07T12:00",
          explanation: "Need Help",
          solved: "true"
        };

        axiosMock.onPost("/api/helprequests/post").reply(202, requesterEmail);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HelpRequestCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByLabelText("RequesterEmail")).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText("RequesterEmail");
        expect(emailInput).toBeInTheDocument();

        const teamInput = screen.getByLabelText("TeamId");
        expect(teamInput).toBeInTheDocument();

        const tableInput = screen.getByLabelText("TableOrBreakoutRoom");
        expect(tableInput).toBeInTheDocument();

        const timeInput = screen.getByLabelText("RequestTime");
        expect(timeInput).toBeInTheDocument();

        const explanationInput = screen.getByLabelText("Explanation");
        expect(explanationInput).toBeInTheDocument();

        const solvedInput = screen.getByTestId("HelpRequestForm-solved");
        expect(solvedInput).toBeInTheDocument();

        const createButton = screen.getByText("Create");
        expect(createButton).toBeInTheDocument();

        fireEvent.change(emailInput, { target: { value: 'testeremail@ucsb.edu' } })
        fireEvent.change(teamInput, { target: { value: '03' } })
        fireEvent.change(tableInput, { target: { value: 'BreakoutRoom' } })
        fireEvent.change(timeInput, { target: { value: '2023-08-07T12:00' } })
        fireEvent.change(explanationInput, { target: { value: "Need Help" } })
        fireEvent.change(solvedInput, { target: { value: "true" } })
        fireEvent.click(createButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].params).toEqual({
        requesterEmail: "testeremail@ucsb.edu",
          teamId: "03",
          tableOrBreakoutRoom: "BreakoutRoom",
          date: "2023-08-07T12:00",
          explanation: "Need Help",
          solved: "true"
        });

        // assert - check that the toast was called with the expected message
        expect(mockToast).toBeCalledWith("New helpRequest Created - id: 3 requesterEmail: testeremail@ucsb.edu");
        expect(mockNavigate).toBeCalledWith({ "to": "/helpRequest" });

    });
});
