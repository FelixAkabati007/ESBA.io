// ======================================================================================
// E-SBA Ghana — Learner Attendance Tracking & Terminal Aggregator (Section 35)
// Tracks daily presence, absence, late arrivals, and auto-computes terminal report totals
// ======================================================================================

import React, { useState } from "react";
import {
  StudentProfile,
  SchoolClass,
  Stream,
  AttendanceRecord,
  AttendanceStatus,
} from "../../types";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Search,
  Filter,
} from "lucide-react";

interface AttendanceModuleProps {
  students: StudentProfile[];
  classes: SchoolClass[];
  streams: Stream[];
  academicYearLabel: string;
  termName: string;
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  students,
  classes,
  streams,
  academicYearLabel,
  termName,
  onSaveAttendance,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "CLS_JHS1");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const classStudents = students.filter((s) => s.currentClassId === selectedClassId);

  const filteredStudents = classStudents.filter((s) =>
    `${s.surname} ${s.firstName} ${s.studentNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setSaveSuccess(false);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((st) => {
      updated[st.id] = status;
    });
    setStatusMap(updated);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    const records: AttendanceRecord[] = classStudents.map((st) => ({
      id: `ATT_${st.id}_${selectedDate}`,
      schoolId: st.schoolId,
      studentId: st.id,
      academicYearId: academicYearLabel,
      termId: termName,
      date: selectedDate,
      status: statusMap[st.id] || "PRESENT",
      recordedBy: "TCH_001",
    }));

    onSaveAttendance(records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Quick summary counts
  const presentCount = classStudents.filter(
    (s) => (statusMap[s.id] || "PRESENT") === "PRESENT"
  ).length;
  const absentCount = classStudents.filter(
    (s) => statusMap[s.id] === "ABSENT"
  ).length;
  const lateCount = classStudents.filter(
    (s) => statusMap[s.id] === "LATE"
  ).length;
  const excusedCount = classStudents.filter(
    (s) => statusMap[s.id] === "EXCUSED"
  ).length;

  const currentClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-700" />
            Learner Attendance Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {academicYearLabel} • {termName} • Daily class roll & terminal attendance aggregation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block">
              Class Level:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block">
              Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-0.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Register
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
          <span className="text-emerald-800 font-semibold block text-[10px] uppercase">
            Present
          </span>
          <span className="text-xl font-extrabold text-emerald-950 mt-0.5 block">
            {presentCount} / {classStudents.length}
          </span>
          <span className="text-[10px] text-emerald-700">
            {classStudents.length > 0
              ? `${Math.round((presentCount / classStudents.length) * 100)}% attendance`
              : "0%"}
          </span>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
          <span className="text-rose-800 font-semibold block text-[10px] uppercase">
            Absent
          </span>
          <span className="text-xl font-extrabold text-rose-950 mt-0.5 block">
            {absentCount}
          </span>
          <span className="text-[10px] text-rose-700">Unexcused</span>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <span className="text-amber-800 font-semibold block text-[10px] uppercase">
            Late
          </span>
          <span className="text-xl font-extrabold text-amber-950 mt-0.5 block">
            {lateCount}
          </span>
          <span className="text-[10px] text-amber-700">Arrived after assembly</span>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <span className="text-blue-800 font-semibold block text-[10px] uppercase">
            Excused
          </span>
          <span className="text-xl font-extrabold text-blue-950 mt-0.5 block">
            {excusedCount}
          </span>
          <span className="text-[10px] text-blue-700">Medical / Permission</span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Attendance register saved and updated for {currentClass?.name}.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Mark:</span>
          <button
            onClick={() => handleMarkAll("PRESENT")}
            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 font-semibold"
          >
            All Present
          </button>
          <button
            onClick={() => handleMarkAll("ABSENT")}
            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 font-semibold"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <th className="p-3">Roll No</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Gender</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3">Remarks / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((st, idx) => {
              const currentStatus = statusMap[st.id] || "PRESENT";
              return (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-500">{st.studentNumber}</td>
                  <td className="p-3 font-semibold text-slate-900">
                    {st.surname}, {st.firstName}
                  </td>
                  <td className="p-3 text-slate-600">{st.gender}</td>
                  <td className="p-3 text-center">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      {[
                        { val: "PRESENT", label: "P", color: "bg-emerald-600 text-white" },
                        { val: "ABSENT", label: "A", color: "bg-rose-600 text-white" },
                        { val: "LATE", label: "L", color: "bg-amber-600 text-white" },
                        { val: "EXCUSED", label: "E", color: "bg-blue-600 text-white" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleStatusChange(st.id, item.val as any)}
                          className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                            currentStatus === item.val
                              ? item.color
                              : "text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Optional notes..."
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-600"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
