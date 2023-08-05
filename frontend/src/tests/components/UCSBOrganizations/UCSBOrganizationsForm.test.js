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
        expect(screen.getByText('orgCode')).toBeInTheDocument();
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

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const submitButton = screen.getByTestId(`${testId}-submit`);
        const inactiveField = screen.getByTestId(`${testId}-inactive`);
        
        fireEvent.change(inactiveField, { target: { value: true } });

        fireEvent.click(submitButton);
        expect(inactiveField.value).toBe("true");

        fireEvent.change(inactiveField, { target: { value: false } });
        
        fireEvent.click(submitButton);
        expect(inactiveField.value).toBe("false");
    });
    
    test("Correct input used", async () => {
        render(
            <Router>
                <UCSBOrganizationsForm />
            </Router>
        );
        await screen.findByTestId(`${testId}-orgTranslationShort`);
        const submitButton = screen.getByTestId(`${testId}-submit`);

        fireEvent.click(submitButton);

        await screen.findByText(/Short Organization Translation is required/);
        expect(screen.getByText(/Full Organization Translation is required/)).toBeInTheDocument();
        expect(screen.getByText(/Inactive status is required/)).toBeInTheDocument();
    });

    test("Correct error messages on bad input", async () => {
        render(
            <Router>
                <UCSBOrganizationsForm/>
            </Router>
        );
        await screen.findByTestId(`${testId}-orgTranslationShort`);
        const inactiveField = screen.getByTestId(`${testId}-inactive`);
        const submitButton = screen.getByTestId(`${testId}-submit`);

        fireEvent.change(inactiveField, { target: { value: "bad-input" } });
        fireEvent.click(submitButton);

        await screen.findByText(/Inactive status is required/);
    });

    test("Form able to render correct input from user", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm/>
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const orgTranslationShortField = screen.getByTestId(`${testId}-orgTranslationShort`);
        const orgTranslationField = screen.getByTestId(`${testId}-orgTranslation`);
        const inactiveField = screen.getByTestId(`${testId}-inactive`);
        const submitButton = screen.getByTestId(`${testId}-submit`);

        fireEvent.change(orgTranslationShortField, { target: { value: "Taiwanese American Student Association "} });
        fireEvent.change(orgTranslationField, { target: { value: "Taiwanese American Student Association at UCSB" } });
        fireEvent.change(inactiveField, { target: { value: false } });
        
        fireEvent.click(submitButton);

        expect(screen.queryByText(/Short Organization Translation is required/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Full Organization Translation is required/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Inactive status is required/)).not.toBeInTheDocument();

    });

});

