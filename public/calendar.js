const escape = s => String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
const localTime = (date,time) => date.replace(/-/g,'')+'T'+time.replace(':','')+'00';
const plusHour = (date,time) => {
  const [y,m,d]=date.split('-').map(Number),[h,min]=time.split(':').map(Number);
  const end=new Date(Date.UTC(y,m-1,d,h+1,min));
  return `${end.getUTCFullYear()}${String(end.getUTCMonth()+1).padStart(2,'0')}${String(end.getUTCDate()).padStart(2,'0')}T${String(end.getUTCHours()).padStart(2,'0')}${String(end.getUTCMinutes()).padStart(2,'0')}00`;
};
const nextDay = date => {
  const [y,m,d]=date.split('-').map(Number);
  const next=new Date(Date.UTC(y,m-1,d+1));
  return `${next.getUTCFullYear()}${String(next.getUTCMonth()+1).padStart(2,'0')}${String(next.getUTCDate()).padStart(2,'0')}`;
};
export function makeCalendar(meeting,deadline) {
  if (!meeting) throw new Error('Chưa xác nhận giờ họp.');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const events=[
    'BEGIN:VEVENT',`UID:meeting-${meeting.date}-${meeting.time.replace(':','')}@nhacdungviec.local`,`DTSTAMP:${stamp}`,
    `DTSTART:${localTime(meeting.date,meeting.time)}`,`DTEND:${plusHour(meeting.date,meeting.time)}`,
    `SUMMARY:${escape('Họp phụ huynh (giờ đã xác nhận)')}`,
    `DESCRIPTION:${escape('Giờ họp đã được phụ huynh xác nhận trong Nhắc Đúng Việc. Kiểm tra lại với giáo viên nếu cần.')}`,
    'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${escape('Sắp tới giờ họp phụ huynh')}`,'TRIGGER:-PT1H','END:VALARM','END:VEVENT'
  ];
  if (deadline) events.push('BEGIN:VEVENT',`UID:deadline-${deadline.date}@nhacdungviec.local`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${deadline.date.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${nextDay(deadline.date)}`,`SUMMARY:${escape('Hạn nộp phiếu thông tin')}`,'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${escape('Ngày mai đến hạn nộp phiếu thông tin')}`,'TRIGGER:-P1D','END:VALARM','END:VEVENT');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nhac Dung Viec//VI','CALSCALE:GREGORIAN','METHOD:PUBLISH',...events,'END:VCALENDAR',''].join('\r\n');
}
