import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

describe("E-SBA Ghana Multi-Tenant Application", () => {
  it("renders global brand header with NaCCA NPLAF badge and role switchers", () => {
    render(<App />);
    expect(screen.getByText("E-SBA Ghana")).toBeInTheDocument();
    expect(screen.getByText("NaCCA NPLAF")).toBeInTheDocument();
    expect(screen.getByText("School Admin / Head")).toBeInTheDocument();
    expect(screen.getByText("Teacher Portal")).toBeInTheDocument();
    expect(screen.getByText("Student Portal")).toBeInTheDocument();
  });

  it("navigates across primary roles: Main Admin, Teacher, and Student", () => {
    render(<App />);

    // 1. Switch to Main Admin
    const mainAdminBtns = screen.getAllByText(/Main Platform Admin/i);
    fireEvent.click(mainAdminBtns[0]);
    expect(screen.getByText("Overview & Health")).toBeInTheDocument();
    expect(screen.getByText("Schools Directory")).toBeInTheDocument();
    expect(screen.getByText("Subscription Plans")).toBeInTheDocument();

    // 2. Switch to Teacher Portal
    const teacherBtns = screen.getAllByText(/Teacher Portal/i);
    fireEvent.click(teacherBtns[0]);
    expect(screen.getByText("Teacher Score Entry Portal")).toBeInTheDocument();
    expect(screen.getByText("Save Draft")).toBeInTheDocument();
    expect(screen.getByText(/Submit for Moderation/i)).toBeInTheDocument();

    // 3. Switch to Student Portal
    const studentBtns = screen.getAllByText(/Student Portal/i);
    fireEvent.click(studentBtns[0]);
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
