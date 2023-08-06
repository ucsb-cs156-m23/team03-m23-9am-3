import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import UCSBOrganizationsForm from "main/components/UCSBOrganizations/UCSBOrganizationsForm";
import { ucsbOrganizationsFixtures } from "fixtures/ucsbOrganizationsFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("UCSBOrganizationsForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["OrgTranslationShort", "OrgTranslation", "Inactive"];
    const testId = "UCSBOrganizationsForm";

    test("renders correctly with no initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });
    });

    test("renders correctly when passing in initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm initialContents={ucsbOrganizationsFixtures.oneOrganization} />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
        expect(screen.getByTestId(`${testId}-orgCode`)).toBeInTheDocument();
        expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("TASA");
    });

    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm />
                </Router>
            </QueryClientProvider>

        );
        expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
        const cancelButton = screen.getByTestId(`${testId}-cancel`);

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });

    test("render boolean value correctly", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm/>
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
        const submitButton = screen.getByTestId(`${testId}-submit`);
        const inactiveField = screen.getByTestId(`${testId}-inactive`);
        expect(inactiveField).toHaveValue("false");
        
        fireEvent.change(inactiveField, { target: { value: "true" } });

        fireEvent.click(submitButton);
        expect(inactiveField).toHaveValue("true");

        fireEvent.change(inactiveField, { target: { value: "false" } });
        
        fireEvent.click(submitButton);
        expect(inactiveField.value).toBe("false");
    });
    
    test("Correct error messages on missing input", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm />
                </Router>
            </QueryClientProvider>
        );

        await screen.findByTestId(`${testId}-submit`);
        const submitButton = screen.getByTestId("UCSBOrganizationsForm-submit");

        fireEvent.click(submitButton);
        
        await screen.findByText(/Organization Code is required/);
        await screen.findByText(/Short Organization Translation is required/);
        await screen.findByText(/Full Organization Translation is required/);
    });

    test("Correct error messages on bad input (31char long for orgTranslationShort", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm />
                </Router>
            </QueryClientProvider>
        );
        await screen.findByTestId(`${testId}-orgTranslationShort`);
        const orgTranslationShortField = screen.getByTestId(`${testId}-orgTranslationShort`);
        const submitButton = screen.getByTestId("UCSBOrganizationsForm-submit");

        fireEvent.change(orgTranslationShortField, { target: { value: 'b'.repeat(31) } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Max length is 30 characters/)).toBeInTheDocument();
        });
    });

    test("No error messages on good input", async () => {
        const mockSubmitAction = jest.fn();

        render(
            <Router>
                <UCSBOrganizationsForm submitAction={mockSubmitAction}/>
            </Router>
        );
        await screen.findByTestId(`${testId}-orgCode`);

        const orgCodeField = screen.getByTestId(`${testId}-orgCode`);
        const orgTranslationShortField = screen.getByTestId(`${testId}-orgTranslationShort`);
        const orgTranslationField = screen.getByTestId(`${testId}-orgTranslation`);
        const inactiveField = screen.getByTestId(`${testId}-inactive`);
        expect(inactiveField).toHaveValue("false");
        const submitButton = screen.getByTestId("UCSBOrganizationsForm-submit");

        fireEvent.change(orgCodeField, { target: { value: 'good-input' } });
        fireEvent.change(orgTranslationShortField, { target: { value: 'good-input' } });
        fireEvent.change(orgTranslationField, { target: { value: 'good-input' } });
        fireEvent.change(inactiveField, { target: { value: "true" } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

        expect(screen.queryByText(/Organization Code is required/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Short Organization Translation is required/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Full Organization Translation is required/)).not.toBeInTheDocument();

    })

});

