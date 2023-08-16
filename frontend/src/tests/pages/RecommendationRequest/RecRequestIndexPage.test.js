import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import RecRequestIndexPage from "main/pages/RecommendationRequest/RecRequestIndexPage";


import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recRequestFixtures } from "fixtures/recRequestFixtures";
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


describe("RecomendationRequestIndexPage tests", () => {

    const axiosMock = new AxiosMockAdapter(axios);

    const testId = "RecRequestTable";

    const setupUserOnly = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    };

    const setupAdminUser = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    };

    test("Renders with Create Button for admin user", async () => {
        setupAdminUser();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/recommendationrequest/all").reply(200, []);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RecRequestIndexPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Create Recommendation Request/)).toBeInTheDocument();
        });
        const button = screen.getByText(/Create Recommendation Request/);
        expect(button).toHaveAttribute("href", "/recommendationrequest/create");
        expect(button).toHaveAttribute("style", "float: right;");
    });

    test("renders three recomendation requests correctly for regular user", async () => {
        setupUserOnly();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/recommendationrequest/all").reply(200, recRequestFixtures.threeRecRequests);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RecRequestIndexPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1"); });
        expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
        expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent("3");

        const createRequestButton = screen.queryByText("Create Recommendation Request");
        expect(createRequestButton).not.toBeInTheDocument();

        const name = screen.getByText("jennifer.lopez@students.university.edu");
        expect(name).toBeInTheDocument();

        const description = screen.getByText("Request for a letter of recommendation for my graduate school application to UCSB.");
        expect(description).toBeInTheDocument();

        // for non-admin users, details button is visible, but the edit and delete buttons should not be visible
        expect(screen.queryByTestId("RecomendationRequestTable-cell-row-0-col-Delete-button")).not.toBeInTheDocument();
        expect(screen.queryByTestId("RecomendationRequestTable-cell-row-0-col-Edit-button")).not.toBeInTheDocument();
    });

    test("renders empty table when backend unavailable, user only", async () => {
        setupUserOnly();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/recommendationrequest/all").timeout();
        const restoreConsole = mockConsole();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RecRequestIndexPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1); });
        
        const errorMessage = console.error.mock.calls[0][0];
        expect(errorMessage).toMatch("Error communicating with backend via GET on /api/recommendationrequest/all");
        restoreConsole();

    });

    test("what happens when you click delete, admin", async () => {
        setupAdminUser();
        const queryClient = new QueryClient();
        axiosMock.onGet("/api/recommendationrequest/all").reply(200, recRequestFixtures.threeRecRequests);
        axiosMock.onDelete("/api/recommendationrequest").reply(200, "Request with id 1 was deleted");


        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RecRequestIndexPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument(); });

        expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");


        const deleteButton = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
        expect(deleteButton).toBeInTheDocument();

        fireEvent.click(deleteButton);

        await waitFor(() => { expect(axiosMock.history.delete.length).toBe(1); });
        expect(axiosMock.history.delete[0].url).toBe("/api/recommendationrequest");
        expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    });

    test("renders without data when API call fails", async () => {
        axiosMock.onGet("/api/recommendationrequest/all").reply(500);
    
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RecRequestIndexPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    
        const createRequestButton = screen.queryByText("Create Recommendation Request");
        expect(createRequestButton).not.toBeInTheDocument();
    
        const rowData = screen.queryByTestId("RecRequestTable-row-0");
        expect(rowData).not.toBeInTheDocument();
    });
});

