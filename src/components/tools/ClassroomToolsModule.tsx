import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Wrench,
  Compass,
  Shuffle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flag,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Plus
} from 'lucide-react';

interface ClassroomToolsProps {
  initialTool?: 'tools_hub' | 'wheel' | 'random_student' | 'timer';
}

export const ClassroomToolsModule: React.FC<ClassroomToolsProps> = ({ initialTool = 'tools_hub' }) => {
  const { classes, students, addToast } = useApp();

  const [activeTool, setActiveTool] = useState<'tools_hub' | 'wheel' | 'random_student' | 'timer'>(initialTool);
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');

  // Keep activeTool in sync if initialTool prop changes
  useEffect(() => {
    setActiveTool(initialTool);
  }, [initialTool]);

  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Sound generator using Web Audio API (no external asset needed)
  const playBeep = (freq = 800, duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Ignore if user hasn't interacted with page
    }
  };

  const playVictorySound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.12);
        osc.stop(audioCtx.currentTime + idx * 0.12 + 0.3);
      });
    } catch {
      // Ignore
    }
  };

  // ==========================================
  // 1. LUCKY WHEEL (VÒNG QUAY MAY MẮN)
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wheelStudents, setWheelStudents] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerStudent, setWinnerStudent] = useState<string | null>(null);
  const [removeWinnerOnPick, setRemoveWinnerOnPick] = useState(false);
  const currentRotationRef = useRef(0);

  // Sync wheel students when class changes
  useEffect(() => {
    if (classStudents.length > 0) {
      setWheelStudents(classStudents.map((s) => s.fullName));
      setWinnerStudent(null);
    }
  }, [selectedClassId, students]);

  // Color palette for wheel sectors
  const sectorColors = [
    '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
    '#E11D48', '#0EA5E9', '#D97706', '#059669', '#7C3AED'
  ];

  // Draw wheel on canvas
  const drawWheel = (rotation = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    const items = wheelStudents.length > 0 ? wheelStudents : ['Danh sách trống'];
    const totalSlices = items.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    for (let i = 0; i < totalSlices; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = sectorColors[i % sectorColors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = totalSlices > 25 ? 'bold 9px sans-serif' : totalSlices > 15 ? 'bold 11px sans-serif' : 'bold 13px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;

      const name = items[i];
      const maxTextWidth = radius - 40;
      let displayName = name;
      if (ctx.measureText(displayName).width > maxTextWidth) {
        displayName = displayName.substring(0, 14) + '...';
      }

      ctx.fillText(displayName, radius - 15, 4);
      ctx.restore();
    }

    // Center pin
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#4F46E5';
    ctx.stroke();

    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUAY', 0, 0);

    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentRotationRef.current);
  }, [wheelStudents]);

  const handleStartSpinWheel = () => {
    if (isSpinning || wheelStudents.length === 0) return;
    setIsSpinning(true);
    setWinnerStudent(null);

    const totalSlices = wheelStudents.length;
    const sliceAngle = 360 / totalSlices;

    // Pick random target winner index
    const targetIndex = Math.floor(Math.random() * totalSlices);
    const chosenName = wheelStudents[targetIndex];

    // Calculate rotation so that target slice aligns with top arrow (270 degrees in canvas coords)
    const targetSliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
    const extraRotations = 360 * (5 + Math.floor(Math.random() * 3));
    // Pointer is at the top (270 degrees)
    const finalRotation = extraRotations + (270 - targetSliceCenter);

    const startRotation = currentRotationRef.current % 360;
    const targetTotalRotation = currentRotationRef.current + (finalRotation - startRotation + 360 * 6);

    const duration = 4000;
    const startTime = performance.now();

    let lastTickSlice = -1;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = currentRotationRef.current + (targetTotalRotation - currentRotationRef.current) * easeOut;

      drawWheel(current);

      // Tick sound when passing slice
      const currentSlice = Math.floor(((270 - (current % 360) + 360) % 360) / sliceAngle);
      if (currentSlice !== lastTickSlice) {
        lastTickSlice = currentSlice;
        playBeep(900, 0.04);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentRotationRef.current = targetTotalRotation % 360;
        setIsSpinning(false);
        setWinnerStudent(chosenName);
        playVictorySound();

        if (removeWinnerOnPick) {
          setWheelStudents((prev) => prev.filter((n) => n !== chosenName));
        }

        addToast({
          type: 'success',
          title: 'Chúc mừng học sinh may mắn!',
          message: `Học sinh: ${chosenName} đã được chọn.`
        });
      }
    };

    requestAnimationFrame(animate);
  };

  const handleResetWheel = () => {
    if (classStudents.length > 0) {
      setWheelStudents(classStudents.map((s) => s.fullName));
      setWinnerStudent(null);
      drawWheel(0);
    }
  };

  // ==========================================
  // 2. RANDOM STUDENT PICKER (CHỌN HỌC SINH)
  // ==========================================
  const [isPickingRandom, setIsPickingRandom] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [calledHistory, setCalledHistory] = useState<{ student: any; timestamp: string; scoreNote?: string }[]>([]);

  const handlePickRandomStudent = () => {
    if (classStudents.length === 0 || isPickingRandom) return;
    setIsPickingRandom(true);
    setSelectedStudent(null);

    let count = 0;
    const totalCycles = 25;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * classStudents.length);
      const candidate = classStudents[randomIdx];
      setSelectedStudent(candidate);
      playBeep(600 + count * 20, 0.03);
      count++;

      if (count >= totalCycles) {
        clearInterval(interval);
        setIsPickingRandom(false);
        playVictorySound();
        const finalCandidate = classStudents[Math.floor(Math.random() * classStudents.length)];
        setSelectedStudent(finalCandidate);

        setCalledHistory((prev) => [
          {
            student: finalCandidate,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          },
          ...prev.slice(0, 9)
        ]);
      }
    }, 80);
  };

  const handleRewardStudent = (scoreText: string) => {
    if (!selectedStudent) return;
    addToast({
      type: 'success',
      title: 'Đã ghi nhận điểm phát biểu',
      message: `${selectedStudent.fullName} (+ ${scoreText})`
    });
  };

  // ==========================================
  // 3. CLASSROOM TIMER & STOPWATCH (ĐỒNG HỒ)
  // ==========================================
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [countdownSeconds, setCountdownSeconds] = useState(300); // 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customSecs, setCustomSecs] = useState(0);

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [laps, setLaps] = useState<{ id: number; time: number }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Countdown Interval
  useEffect(() => {
    if (!isTimerRunning || timerMode !== 'countdown') return;
    const id = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsTimerRunning(false);
          // Play loud alarm
          playVictorySound();
          alert('⏰ HẾT GIỜ THẢO LUẬN / LÀM BÀI TRÊN LỚP!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, timerMode]);

  // Stopwatch Interval
  useEffect(() => {
    if (!isTimerRunning || timerMode !== 'stopwatch') return;
    const id = setInterval(() => {
      setStopwatchSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, timerMode]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleApplyCustomCountdown = () => {
    const total = customMinutes * 60 + customSecs;
    if (total > 0) {
      setCountdownSeconds(total);
      setIsTimerRunning(false);
    }
  };

  const handleRecordLap = () => {
    setLaps((prev) => [{ id: prev.length + 1, time: stopwatchSeconds }, ...prev]);
  };

  // ==========================================
  // 4. RANDOM GROUP GENERATOR
  // ==========================================
  const [numGroups, setNumGroups] = useState(4);
  const [generatedGroups, setGeneratedGroups] = useState<{ groupName: string; members: string[] }[]>([]);

  const handleGenerateGroups = () => {
    if (classStudents.length === 0) return;
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    const groups: { groupName: string; members: string[] }[] = Array.from(
      { length: numGroups },
      (_, i) => ({
        groupName: `Nhóm ${i + 1}`,
        members: []
      })
    );

    shuffled.forEach((s, idx) => {
      groups[idx % numGroups].members.push(s.fullName);
    });

    setGeneratedGroups(groups);
    addToast({
      type: 'success',
      title: 'Đã chia nhóm thành công',
      message: `Đã phân chia lớp ${selectedClass.name} thành ${numGroups} nhóm đều nhau.`
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Navigation Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Công Cụ Tương Tác</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Vòng quay may mắn, chọn học sinh ngẫu nhiên, đồng hồ đếm ngược và chia nhóm lớp học
          </p>
        </div>

        {/* Class selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Áp dụng cho:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-indigo-200 dark:border-indigo-800 rounded-xl bg-white dark:bg-slate-800 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                Lớp {c.name} ({c.studentCount} học sinh)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Tool Tabs with Bright Borders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { id: 'tools_hub', label: 'Công cụ tương tác', icon: Wrench, desc: 'Tổng hợp tiện ích' },
          { id: 'wheel', label: 'Vòng quay may mắn', icon: Compass, desc: 'Quay thưởng & gọi tên' },
          { id: 'random_student', label: 'Chọn học sinh', icon: Shuffle, desc: 'Bốc thăm ngẫu nhiên' },
          { id: 'timer', label: 'Đồng hồ bấm giờ', icon: Clock, desc: 'Đếm ngược & bấm giờ' }
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTool(t.id as any)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white border-indigo-100 text-slate-800 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
              <span className="font-bold text-xs block">{t.label}</span>
              <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TOOL 1: VÒNG QUAY MAY MẮN (LUCKY WHEEL) */}
      {/* ============================================================== */}
      {activeTool === 'wheel' && (
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Interactive Canvas Wheel */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Pointer indicator */}
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-rose-500 z-10 -mb-4 drop-shadow-md animate-bounce" />

              <div className="p-3 bg-slate-50 rounded-full border-4 border-indigo-200 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={380}
                  className="rounded-full shadow-lg max-w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  disabled={isSpinning || wheelStudents.length === 0}
                  onClick={handleStartSpinWheel}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSpinning ? 'Đang quay...' : 'Bắt đầu quay may mắn'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetWheel}
                  disabled={isSpinning}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>

            {/* Right: Winner Card & Roster Options */}
            <div className="w-full md:w-80 space-y-4">
              {/* Winner Announcement Banner */}
              {winnerStudent ? (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-xs text-center animate-in zoom-in-95 duration-200">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                    🎉 Học sinh được gọi tên / trúng thưởng:
                  </span>
                  <h3 className="text-xl font-bold text-emerald-900 mt-1 block">
                    {winnerStudent}
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Lớp {selectedClass.name} · Năm học 2024 - 2025
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center text-xs text-indigo-900">
                  Nhấn nút <strong>"Bắt đầu quay may mắn"</strong> để hệ thống quay ngẫu nhiên 1 bạn học sinh trong danh sách.
                </div>
              )}

              {/* Settings Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Tùy chọn vòng quay</h4>
                
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeWinnerOnPick}
                    onChange={(e) => setRemoveWinnerOnPick(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Loại bỏ học sinh đã quay trúng khỏi lượt sau</span>
                </label>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Số học sinh trong vòng quay:</span>
                  <span className="font-mono font-bold text-indigo-700">{wheelStudents.length} bạn</span>
                </div>
              </div>

              {/* Student Tags in Wheel */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl max-h-48 overflow-y-auto space-y-1">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">
                  Danh sách học sinh trên vòng quay:
                </span>
                <div className="flex flex-wrap gap-1">
                  {wheelStudents.map((name, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TOOL 2: CHỌN HỌC SINH NGẪU NHIÊN (RANDOM STUDENT PICKER) */}
      {/* ============================================================== */}
      {activeTool === 'random_student' && (
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="max-w-xl mx-auto space-y-6">
            {/* Center Display Card */}
            <div className="p-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-200 rounded-3xl min-h-[220px] flex flex-col items-center justify-center text-center shadow-xs">
              {selectedStudent ? (
                <div className="space-y-2 animate-in zoom-in-95 duration-150">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-2xs">
                    Học Sinh Được Chọn Lên Bảng
                  </span>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                    {selectedStudent.fullName}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    Mã số: <strong className="text-indigo-700">{selectedStudent.studentCode}</strong> · Lớp {selectedStudent.className}
                  </p>

                  {/* Quick scoring options */}
                  <div className="pt-4 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleRewardStudent('+10 điểm')}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors inline-flex items-center gap-1"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>+10 Điểm xuất sắc</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRewardStudent('+1 điểm phát biểu')}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-colors inline-flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>+1 Điểm phát biểu</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <Shuffle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Sẵn sàng gọi học sinh ngẫu nhiên</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Hệ thống sẽ chạy ngẫu nhiên qua các học sinh lớp {selectedClass.name} và dừng lại để chọn 1 bạn.
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                type="button"
                disabled={isPickingRandom || classStudents.length === 0}
                onClick={handlePickRandomStudent}
                className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-md disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                <span>{isPickingRandom ? 'Đang bốc thăm ngẫu nhiên...' : 'Bốc thăm gọi 1 bạn lên bảng'}</span>
              </button>
            </div>

            {/* Call History */}
            {calledHistory.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Lịch sử các bạn đã được gọi trong tiết này:
                </span>
                <div className="divide-y divide-slate-200">
                  {calledHistory.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{idx + 1}.</span>
                        <span className="font-bold text-slate-900">{item.student.fullName}</span>
                        <span className="text-[11px] font-mono text-slate-400">({item.student.studentCode})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TOOL 3: ĐỒNG HỒ BẤM GIỜ & ĐẾM NGƯỢC (CLASSROOM TIMER) */}
      {/* ============================================================== */}
      {activeTool === 'timer' && (
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTimerMode('countdown');
                setIsTimerRunning(false);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                timerMode === 'countdown'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Đồng hồ đếm ngược (Hạn giờ)
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerMode('stopwatch');
                setIsTimerRunning(false);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                timerMode === 'stopwatch'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Đồng hồ bấm giờ (Tăng dần & Lap)
            </button>
          </div>

          {/* Large Clock Display */}
          <div className="max-w-md mx-auto p-8 bg-slate-950 text-white rounded-3xl text-center shadow-xl border-4 border-slate-800">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
              {timerMode === 'countdown' ? 'Thời gian thảo luận còn lại' : 'Thời gian đã trôi qua'}
            </span>
            <div className="text-6xl font-mono font-black text-amber-400 tracking-wider">
              {timerMode === 'countdown' ? formatTime(countdownSeconds) : formatTime(stopwatchSeconds)}
            </div>
          </div>

          {/* Controls for Countdown */}
          {timerMode === 'countdown' && (
            <div className="space-y-4 max-w-md mx-auto text-center">
              {/* Preset buttons */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  { label: '1 Phút', s: 60 },
                  { label: '3 Phút', s: 180 },
                  { label: '5 Phút', s: 300 },
                  { label: '10 Phút', s: 600 },
                  { label: '15 Phút', s: 900 }
                ].map((p) => (
                  <button
                    key={p.s}
                    type="button"
                    onClick={() => {
                      setCountdownSeconds(p.s);
                      setIsTimerRunning(false);
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400">Tùy chỉnh:</span>
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-14 px-2 py-1 text-center font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-slate-600 dark:text-slate-400">phút</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={customSecs}
                  onChange={(e) => setCustomSecs(Number(e.target.value))}
                  className="w-14 px-2 py-1 text-center font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-slate-600 dark:text-slate-400">giây</span>
                <button
                  type="button"
                  onClick={handleApplyCustomCountdown}
                  className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
                >
                  Áp dụng
                </button>
              </div>

              {/* Play / Pause / Reset */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-8 py-3 text-xs font-bold text-white rounded-2xl shadow-md inline-flex items-center gap-2 transition-all ${
                    isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isTimerRunning ? 'Tạm dừng đếm ngược' : 'Bắt đầu đếm ngược'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setCountdownSeconds(300);
                  }}
                  className="px-4 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>
          )}

          {/* Controls for Stopwatch */}
          {timerMode === 'stopwatch' && (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-8 py-3 text-xs font-bold text-white rounded-2xl shadow-md inline-flex items-center gap-2 transition-all ${
                    isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isTimerRunning ? 'Tạm dừng' : 'Bắt đầu bấm giờ'}</span>
                </button>

                <button
                  type="button"
                  disabled={!isTimerRunning}
                  onClick={handleRecordLap}
                  className="px-4 py-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Flag className="w-4 h-4" />
                  <span>Ghi vòng (Lap)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setStopwatchSeconds(0);
                    setLaps([]);
                  }}
                  className="px-4 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đặt lại</span>
                </button>
              </div>

              {/* Laps List */}
              {laps.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Các mốc thời gian đã ghi nhận:</span>
                  <div className="divide-y divide-slate-200 max-h-36 overflow-y-auto">
                    {laps.map((lap) => (
                      <div key={lap.id} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Vòng {lap.id}</span>
                        <span className="font-mono font-bold text-indigo-700">{formatTime(lap.time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TOOL 4: CÔNG CỤ TƯƠNG TÁC TỔNG HỢP & CHIA NHÓM (TOOLS HUB) */}
      {/* ============================================================== */}
      {activeTool === 'tools_hub' && (
        <div className="space-y-6">
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTool('wheel')}
              className="p-5 bg-white border-2 border-indigo-100 hover:border-indigo-400 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Vòng Quay May Mắn
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Bánh xe quay thưởng ngẫu nhiên tên học sinh theo lớp, phát âm thanh và hiệu ứng sinh động.
              </p>
              <span className="text-xs font-bold text-indigo-600 mt-3 inline-block">Mở vòng quay →</span>
            </div>

            <div
              onClick={() => setActiveTool('random_student')}
              className="p-5 bg-white border-2 border-indigo-100 hover:border-indigo-400 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Shuffle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Bốc Thăm Chọn Học Sinh
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Gọi học sinh ngẫu nhiên lên bảng trả lời câu hỏi và cộng điểm phát biểu nhanh.
              </p>
              <span className="text-xs font-bold text-purple-600 mt-3 inline-block">Bốc thăm ngay →</span>
            </div>

            <div
              onClick={() => setActiveTool('timer')}
              className="p-5 bg-white border-2 border-indigo-100 hover:border-indigo-400 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Đồng Hồ Đếm Ngược & Bấm Giờ
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Bấm giờ thảo luận nhóm, tính giờ làm bài kiểm tra với chuông báo âm thanh kết thúc.
              </p>
              <span className="text-xs font-bold text-amber-600 mt-3 inline-block">Mở đồng hồ →</span>
            </div>
          </div>

          {/* Group Generator Tool */}
          <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Chia Nhóm Ngẫu Nhiên Lớp {selectedClass.name}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động phân bổ đều học sinh vào các tổ / nhóm hoạt động
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <span>Số nhóm:</span>
                  <select
                    value={numGroups}
                    onChange={(e) => setNumGroups(Number(e.target.value))}
                    className="px-3 py-1 text-xs border border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-slate-800 font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={2} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">2 Nhóm</option>
                    <option value={3} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">3 Nhóm</option>
                    <option value={4} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">4 Nhóm (Tổ)</option>
                    <option value={6} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">6 Nhóm</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateGroups}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Chia nhóm ngay</span>
                </button>
              </div>
            </div>

            {generatedGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {generatedGroups.map((grp) => (
                  <div key={grp.groupName} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-bold text-xs text-indigo-700">{grp.groupName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{grp.members.length} bạn</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 max-h-48 overflow-y-auto">
                      {grp.members.map((m, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl">
                Nhấn nút <strong>"Chia nhóm ngay"</strong> để hệ thống tự động bốc thăm chia ngẫu nhiên học sinh lớp {selectedClass.name}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
