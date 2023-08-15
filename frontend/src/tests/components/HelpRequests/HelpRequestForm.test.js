import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { QueryClient, QueryClientProvider } from "react-query";
import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("HelpRequestForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["RequesterEmail", "TeamId", "TableOrBreakoutRoom", "RequestTime", "Explanation", "Solved"];
    const testId = "HelpRequestForm";

    test("renders correctly with no initialContents", async () => {
      render(
          <QueryClientProvider client={queryClient}>
              <Router>
                  <HelpRequestForm />
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
                <HelpRequestForm initialContents={helpRequestFixtures.onehelpRequest} />
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
                <HelpRequestForm />
            </Router>
        </QueryClientProvider>
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
});



test("Correct Error messsages on bad input", async () => {

  render(
      <Router  >
          <HelpRequestForm />
      </Router>
  );
  await screen.findByTestId(`${testId}-requesterEmail`);
    const requestTimeField = screen.getByTestId(`${testId}-requestTime`);
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

  fireEvent.change(requestTimeField, { target: { value: 'bad-input' } });
  fireEvent.click(submitButton);

  await screen.findByText(/requestTime is required/);
});

test("Correct Error messsages on bad input (31char long for requesterEmail)", async () => {

  render(
      <Router  >
          <HelpRequestForm />
      </Router>
  );
  await screen.findByTestId(`${testId}-requesterEmail`);
  const requesterEmailField = screen.getByTestId(`${testId}-requesterEmail`);
  const requestTimeField = screen.getByTestId(`${testId}-requestTime`);
  const submitButton = screen.getByTestId("HelpRequestForm-submit");

  fireEvent.change(requesterEmailField, { target: { value: 'a'.repeat(31) } });
  fireEvent.change(requestTimeField, { target: { value: '2022-01-02T12:00' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
});
  expect(screen.queryByText(/requestTime is required/)).not.toBeInTheDocument();

});

test("Correct Error messsages on bad input (31char long for teamId)", async () => {

  render(
      <Router  >
          <HelpRequestForm />
      </Router>
  );
  await screen.findByTestId(`${testId}-requesterEmail`);
  const teamIdField = screen.getByTestId(`${testId}-teamId`);
  const submitButton = screen.getByTestId("HelpRequestForm-submit");

  fireEvent.change(teamIdField, { target: { value: 'a'.repeat(31) } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
});





});


test("Correct Error messsages on bad input (31char long for tableorbreakoutRoom)", async () => {

  render(
      <Router  >
          <HelpRequestForm />
      </Router>
  );
  await screen.findByTestId(`${testId}-requesterEmail`);
  const tableOrBreakoutRoomField = screen.getByTestId(`${testId}-tableOrBreakoutRoom`);
  const submitButton = screen.getByTestId("HelpRequestForm-submit");

  fireEvent.change(tableOrBreakoutRoomField, { target: { value: 'a'.repeat(31) } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
});

});

test("that the correct validations are performed", async () => {

  render(
      <Router  >
          <HelpRequestForm />
      </Router>
  );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    const solvedField = screen.getByLabelText("Solved");
    expect(solvedField).toHaveValue("true");
    fireEvent.change(solvedField, { target: { value: "true" } });
    fireEvent.click(submitButton);
    
    expect(solvedField.value).toBe("true");
    fireEvent.change(solvedField, { target: { value: "false" } });
    fireEvent.click(submitButton);
    expect(solvedField).toHaveValue("false");
    

    await screen.findByText(/requesterEmail is required/);
    expect(screen.getByText(/teamId is required/)).toBeInTheDocument();
    expect(screen.getByText(/tableOrBreakoutRoom is required/)).toBeInTheDocument();
    expect(screen.getByText(/requestTime is required/)).toBeInTheDocument();
    expect(screen.getByText(/explanation is required/)).toBeInTheDocument();
    


    const requesterEmailInput = screen.getByTestId(`${testId}-requesterEmail`);
    fireEvent.change(requesterEmailInput, { target: { value: "a".repeat(31) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    });

    //expect(screen.queryByText(/requestTime must be in ISO format/)).not.toBeInTheDocument();
});


});
