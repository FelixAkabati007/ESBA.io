import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SignInModal } from "../components/auth/SignInModal";
import { SchoolRegistrationModal } from "../components/auth/SchoolRegistrationModal";
import { LegalModal } from "../components/legal/LegalModal";

describe("Commercial Auth & Onboarding Experience", () => {
  it("renders SignInModal with 4 demo roles, high-contrast labels, and credentials autofill", () => {
    const handleSuccess = vi.fn();
    const handleForgotPassword = vi.fn();
    const handleRegister = vi.fn();
    const handleLegal = vi.fn();

    render(
      <SignInModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={handleSuccess}
        onOpenForgotPassword={handleForgotPassword}
        onOpenRegisterSchool={handleRegister}
        onOpenLegal={handleLegal}
      />
    );

    // Verify heading and subhead
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByText("Choose a demo role to explore the platform.")).toBeInTheDocument();

    // Verify 4 demo role kickers
    expect(screen.getByText("PLATFORM")).toBeInTheDocument();
    expect(screen.getByText("SCHOOL")).toBeInTheDocument();
    expect(screen.getByText("CLASSROOM")).toBeInTheDocument();
    expect(screen.getByText("LEARNER")).toBeInTheDocument();

    // Verify role titles
    expect(screen.getByText("Main Admin")).toBeInTheDocument();
    expect(screen.getByText("School Admin")).toBeInTheDocument();
    expect(screen.getByText("Teacher")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();

    // Click Teacher role and verify autofill
    const teacherRoleBtn = screen.getByRole("button", { name: /CLASSROOM Teacher/i });
    fireEvent.click(teacherRoleBtn);

    const emailInput = screen.getByPlaceholderText("name@school.edu.gh") as HTMLInputElement;
    expect(emailInput.value).toBe("kofi.mensah@achimota-basic.edu.gh");

    // Click Sign In
    const signInBtn = screen.getByRole("button", { name: /^Sign in$/i });
    fireEvent.click(signInBtn);
  });

  it("triggers SchoolRegistrationModal and calls onRegisterSuccess", () => {
    const handleRegisterSuccess = vi.fn();
    const handleClose = vi.fn();
    const handleSwitchToLogin = vi.fn();

    render(
      <SchoolRegistrationModal
        isOpen={true}
        onClose={handleClose}
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    );

    expect(screen.getByText("Register Your Basic School")).toBeInTheDocument();
    expect(screen.getByText(/Deploy a dedicated E-SBA multi-tenant instance/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Pokuase Basic School")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Complete Registration & Launch Portal/i })).toBeInTheDocument();
  });

  it("renders LegalModal for Privacy Policy and Terms of Service", () => {
    const handleClose = vi.fn();

    const { rerender } = render(<LegalModal type="PRIVACY" onClose={handleClose} />);
    expect(screen.getByText("Privacy Policy & Data Protection")).toBeInTheDocument();
    expect(screen.getAllByText(/Row Level Security \(RLS\)/i)[0]).toBeInTheDocument();

    rerender(<LegalModal type="TERMS" onClose={handleClose} />);
    expect(screen.getByText("Terms of Service & Usage Agreement")).toBeInTheDocument();
    expect(screen.getAllByText(/NaCCA NPLAF Compliance/i)[0]).toBeInTheDocument();
  });
});
