import test from 'node:test';
import assert from 'node:assert/strict';
import {extract,toLines} from '../public/extract.js';
import {makeCalendar} from '../public/calendar.js';

test('two source-backed hours block automatic resolution while supplies and deadline survive',()=>{
  const lines=toLines('Họp phụ huynh: 8:00 ngày 28/09/2026, phòng 203.\nMang theo bút và sổ tay.\nNộp phiếu thông tin trước 27/09/2026.\nHọp phụ huynh: 9:00 ngày 28/09/2026, phòng 203.');
  const facts=extract(lines);
  assert.equal(facts.conflict,true);
  assert.deepEqual(facts.meetings.map(m=>m.time),['08:00','09:00']);
  assert.equal(facts.meetings[1].sourceIds[0],'L4');
  assert.equal(facts.tasks.length,2);
  assert.equal(facts.tasks.find(x=>x.kind==='deadline').date,'2026-09-27');
});

test('OCR-like accent loss does not fabricate a meeting from a chat timestamp',()=>{
  const facts=extract(toLines('Co Huong 17:20\nHop phu huynh 8h00 ngay 28/09/2026\nNop phieu thong tin truoc 27/09/2026'));
  assert.equal(facts.meetings.length,1);
  assert.equal(facts.meetings[0].time,'08:00');
  assert.equal(facts.conflict,false);
});

test('calendar contains confirmed hour and an exclusive next-day end for all-day deadline',()=>{
  assert.throws(()=>makeCalendar(null,null));
  const ics=makeCalendar({date:'2026-09-28',time:'09:00'},{date:'2026-09-27'});
  assert.match(ics,/DTSTART:20260928T090000/);
  assert.match(ics,/DTSTART;VALUE=DATE:20260927\r\nDTEND;VALUE=DATE:20260928/);
  assert.match(ics,/TRIGGER:-PT1H/);
  assert.match(ics,/TRIGGER:-P1D/);
});
