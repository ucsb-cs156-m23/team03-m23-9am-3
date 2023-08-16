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

    test("that the validations for the 'done' field are performed", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm />
                </Router>
            </QueryClientProvider>
        );
    
        const submitButton = screen.getByText(/Create/);
        
        const doneField = screen.getByTestId("RecRequestForm-done");
        fireEvent.change(doneField, { target: { value: "invalid_value" } });
        fireEvent.click(submitButton);
        
        await waitFor(() => expect(screen.getByText(/"true" or "false" required/)).toBeInTheDocument());
        
        fireEvent.change(doneField, { target: { value: "" } });
        fireEvent.click(submitButton);
        
        await waitFor(() => expect(screen.getByText(/Done is required/)).toBeInTheDocument());
    });

    test("shows error when 'done' field has invalid input", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm />
                </Router>
            </QueryClientProvider>
        );
    
        const submitButton = screen.getByText(/Create/);
        const doneField = screen.getByTestId("RecRequestForm-done");
        
        // Enter an invalid value for 'done' field
        fireEvent.change(doneField, { target: { value: "invalid_value" } });
        fireEvent.click(submitButton);
        
        // Expect the error message to be in the document
        await waitFor(() => expect(screen.getByText(/"true" or "false" required/)).toBeInTheDocument());
    });
    
    test("does not show error when 'done' field has valid input", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm />
                </Router>
            </QueryClientProvider>
        );
    
        const submitButton = screen.getByText(/Create/);
        const doneField = screen.getByTestId("RecRequestForm-done");
        
        // Enter a valid value for 'done' field
        fireEvent.change(doneField, { target: { value: "true" } });
        fireEvent.click(submitButton);
        
        // Expect the error message to not be in the document
        const errorMessage = screen.queryByText(/"true" or "false" required/);
        expect(errorMessage).not.toBeInTheDocument();
    });

    test("shows error when 'done' field is empty", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecRequestForm />
                </Router>
            </QueryClientProvider>
        );
    
        const submitButton = screen.getByText(/Create/);
        const doneField = screen.getByTestId("RecRequestForm-done");
        
        // Leave the 'done' field empty
        fireEvent.change(doneField, { target: { value: "" } });
        fireEvent.click(submitButton);
        
        // Expect the error message to be in the document
        await waitFor(() => expect(screen.getByText(/Done is required/)).toBeInTheDocument());
    });
    
});