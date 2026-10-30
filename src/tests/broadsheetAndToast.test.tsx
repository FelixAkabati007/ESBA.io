import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { BroadsheetMatrix } from "../components/school/BroadsheetMatrix";
import { ToastProvider, useToast } from "../context/ToastContext";
import {
  DEMO_SCHOOL,
  DEMO_ACADEMIC_YEARS,
  DEMO_TERMS,
  DEMO_CLASSES,
  DEMO_STREAMS,
  DEMO_SUBJECTS,
  DEMO_STUDENTS,
  DEMO_SCORE_RECORDS,
} from "../data/mockData";
import { apiClient } from "../services/apiClient";

const TestToastComponent = () => {
  const { success, error, warning, info } = useToast();
  return (
    <div>
      <button onClick={() => success("Saved Successfully", "Score records updated")}>
        Trigger Success
      </button>
      <button onClick={() => error("Validation Error", "Score exceeds maximum allowable")}>
        Trigger Error
      </button>
      <button onClick={() => warning("Attendance Alert", "Learner has 3 unexcused absences")}>
        Trigger Warning
      </button>
      <button onClick={() => info("Sync Completed", "Offline cache reconciled with server")}>
        Trigger Info
      </button>
    </div>
  );
};

describe("Master Class Broadsheet Matrix & Global Notifications", () => {
  it("renders BroadsheetMatrix with composite learner grades, ranks, and export button", () => {
    const handleOpenReport = vi.fn();

    render(
      <ToastProvider>
        <BroadsheetMatrix
          school={DEMO_SCHOOL}
          academicYear={DEMO_ACADEMIC_YEARS[1]}
          term={DEMO_TERMS[0]}
          classes={DEMO_CLASSES}
          streams={DEMO_STREAMS}
          subjects={DEMO_SUBJECTS}
          students={DEMO_STUDENTS}
          scoreRecords={DEMO_SCORE_RECORDS}
          onOpenReportCard={handleOpenReport}
        />
      </ToastProvider>
    );

    // Verify Title & NaCCA Badge
    expect(screen.getByText(/Class Terminal Broadsheet/i)).toBeInTheDocument();
    expect(screen.getByText("NaCCA Composite Register")).toBeInTheDocument();

    // Verify Export and Print buttons
    expect(screen.getByRole("button", { name: /Export XLSX/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Print Broadsheet/i })).toBeInTheDocument();

    // Verify Table Headers
    expect(screen.getByText("Learner No")).toBeInTheDocument();
    expect(screen.getByText("Student Name")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();

    // Click Export XLSX
    const exportBtn = screen.getByRole("button", { name: /Export XLSX/i });
    fireEvent.click(exportBtn);

    // Verify toast was triggered
    expect(screen.getByText("Broadsheet Exported")).toBeInTheDocument();
  });

  it("triggers and displays Toast notifications correctly across types", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    // Trigger Success
    fireEvent.click(screen.getByText("Trigger Success"));
    expect(screen.getByText("Saved Successfully")).toBeInTheDocument();
    expect(screen.getByText("Score records updated")).toBeInTheDocument();

    // Trigger Error
    fireEvent.click(screen.getByText("Trigger Error"));
    expect(screen.getByText("Validation Error")).toBeInTheDocument();
    expect(screen.getByText("Score exceeds maximum allowable")).toBeInTheDocument();

    // Trigger Warning
    fireEvent.click(screen.getByText("Trigger Warning"));
    expect(screen.getByText("Attendance Alert")).toBeInTheDocument();

    // Trigger Info
    fireEvent.click(screen.getByText("Trigger Info"));
    expect(screen.getByText("Sync Completed")).toBeInTheDocument();
  });

  it("apiClient verifies report card cryptographic authenticity", async () => {
    const res = await apiClient.verifyReport("ESBA-2026-9F72A81");
    expect(res).toBeDefined();
    expect(res.verificationCode).toBe("ESBA-2026-9F72A81");
    expect(res.valid).toBe(true);
  });
});
