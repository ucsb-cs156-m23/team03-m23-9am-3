import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import RecRequestForm from "main/components/RecommendationRequest/RecRequestForm";
import { recRequestFixtures } from "fixtures/recRequestFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("RecRequestForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ['Requester Email', 'Professor Email', 'Explanation', 'Date Requested', 'Date Needed', 'Is it done?'];
    const testId = "RecRequestForm";

    test("renders correctly with no initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-professorEmail`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-explanation`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-dateRequested`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-dateNeeded`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-done`)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

    });

    test("renders correctly when passing in initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm initialContents={recRequestFixtures.oneRecRequest} />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
        expect(screen.getByText(`Id`)).toBeInTheDocument();
    });


    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm />
                </Router>
            </QueryClientProvider>
        );
        expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
        const cancelButton = screen.getByTestId(`${testId}-cancel`);

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });

    test("that the correct validations are performed", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const submitButton = screen.getByText(/Create/);
        fireEvent.click(submitButton);

        await screen.findByTestId("RecRequestForm-requesterEmail");
        expect(screen.getByText(/Requester Email is required/)).toBeInTheDocument();
        expect(screen.getByText(/Professor Email is required/)).toBeInTheDocument();
        expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
        expect(screen.getByText(/Date Requested is required/)).toBeInTheDocument();
        expect(screen.getByText(/Date Needed is required/)).toBeInTheDocument();
    });

    test("that navigate(-1) is called when Cancel is clicked", async () => {

        render(
            <Router  >
                <RecRequestForm />
            </Router>
        );
        await screen.findByTestId("RecRequestForm-cancel");
        const cancelButton = screen.getByTestId("RecRequestForm-cancel");

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));

    });
});