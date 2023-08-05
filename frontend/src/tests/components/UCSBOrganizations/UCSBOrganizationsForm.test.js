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

    const expectedHeaders = ["OrgCode", "OrgTranslationShort", "OrgTranslation", "Inactive"];
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
        const submitButton = screen.getByText(/Create/);
        const inactiveField = screen.getByLabelText("Inactive");
        expect(inactiveField).toHaveValue("false");
        
        fireEvent.change(inactiveField, { target: { value: "true" } });

        fireEvent.click(submitButton);
        expect(inactiveField).toHaveValue("true");

        fireEvent.change(inactiveField, { target: { value: "false" } });
        
        fireEvent.click(submitButton);
        expect(inactiveField.value).toBe("false");
    });
    
    test("Correct input used", async () => {
        render(
            <Router>
                <UCSBOrganizationsForm />
            </Router>
        );
        await screen.findByTestId(`${testId}-OrgCode`);
        const submitButton = screen.getByTestId(`${testId}-submit`);

        fireEvent.click(submitButton);

        await screen.findByText(/Organization Code is required/);
        expect(screen.getByText(/Short Organization Translation is required/)).toBeInTheDocument();
        expect(screen.getByText(/Full Organization Translation is required/)).toBeInTheDocument();
        const inactiveField = screen.getByLabelText("Inactive");
        expect(inactiveField).toHaveValue("false"); 
    });

    test("Correct error messages on bad input", async () => {
        render(
            <Router>
                <UCSBOrganizationsForm/>
            </Router>
        );
        await screen.findByTestId(`${testId}-OrgCode`);
        const inactiveField = screen.getByTestId(`${testId}-inactive`);
        const submitButton = screen.getByTestId(`${testId}-submit`);

        fireEvent.change(inactiveField, { target: { value: 'bad-input' } });
        fireEvent.click(submitButton);

        await screen.findByText(/Inactive status is required/);
    })

});

