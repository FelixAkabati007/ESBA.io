import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

describe("E-SBA Ghana Multi-Tenant Application", () => {
  it("renders global brand header with NaCCA NPLAF badge and role switchers", () => {
    render(<App />);
    expect(screen.getAllByText(/E-SBA Ghana/i)[0]).toBeInTheDocument();
    expect(screen.getByText("NaCCA NPLAF")).toBeInTheDocument();
    expect(screen.getAllByText(/Teacher Portal/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Student Portal/i)[0]).toBeInTheDocument();
  });

  it("navigates across primary roles: Main Admin, Teacher, and Student", () => {
    render(<App />);

    // 1. Switch to Main Admin via Launch Admin Portal button
    const launchAdminBtn = screen.getByText("Launch Admin Portal");
    fireEvent.click(launchAdminBtn);
    expect(screen.getAllByText("Overview & Health")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Schools Directory")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Subscription Plans")[0]).toBeInTheDocument();

    // 2. Open user menu and switch to Teacher Portal
    const userMenuBtn = screen.getByLabelText("User Account Menu");
    fireEvent.click(userMenuBtn);
    const teacherBtn = screen.getByRole("button", { name: /Teacher Portal/i });
    fireEvent.click(teacherBtn);
    expect(screen.getByText("Teacher Score Entry Portal")).toBeInTheDocument();
    expect(screen.getByText("Save Draft")).toBeInTheDocument();
    expect(screen.getByText(/Submit for Moderation/i)).toBeInTheDocument();

    // 3. Open user menu and switch to Student Portal
    const userMenuBtn2 = screen.getByLabelText("User Account Menu");
    fireEvent.click(userMenuBtn2);
    const studentBtn = screen.getByRole("button", { name: /Student Portal/i });
    fireEvent.click(studentBtn);
    expect(screen.getByText("Learner Student Portal")).toBeInTheDocument();
    expect(screen.getByText(/Current Term Results/i)).toBeInTheDocument();
  });

  it("opens public verification modal when clicking Verify Report button", () => {
    render(<App />);
    const verifyBtns = screen.getAllByText(/Verify Report/i);
    fireEvent.click(verifyBtns[0]);
    expect(
      screen.getByText("Official Ghana E-SBA Report Verification")
    ).toBeInTheDocument();
  });
});
