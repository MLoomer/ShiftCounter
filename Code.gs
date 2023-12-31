class WeekArray {
  constructor() {
    this.array = [];
    for (let i = 0; i < 7; i++) {
      this.array.push(Array(24).fill(0))
    }
  }
  addShifts(agent) {
    agent.forEach((shift) => {
      let hours = 9;
      let shifts = this.convertShift(shift.startHour, hours, shift.day);
      shifts.forEach((shift) => {
        for (let i = shift.start; i <= shift.end-1; i++) {
          this.array[shift.date][i] = this.array[shift.date][i] + 1
        }
      })
    })
  }

  convertShift(start, length, day) {
    let arr = [];
    let shift;
    //return array of day, start, end
    if ((start + length) < 24) {
      shift = new ShiftTimes(day, start, start + length)
      arr.push(shift.shiftSpecs())
      return arr;
    }
    // if > 24

    let newDay = day == 6 ? 0 : day + 1;
    let newDayEnd = (start + length) - 24;
    shift = new ShiftTimes(day, start, 24)
    arr.push(shift.shiftSpecs())
    shift = new ShiftTimes(newDay, 0, newDayEnd)
    arr.push(shift.shiftSpecs())
    return arr;
  }

  summary() {
    return this.array;
  }
}

class ShiftTimes {
  constructor(day, start, end) {
    this.shift = {
      date: day,
      start: start,
      end: end
    }
  }
  shiftSpecs() {
    return this.shift;
  }
}

//needs int input
class Agent {
  constructor(row) {
    this.workShift = [];
    let [number, team, ...shifts] = row;
    shifts.forEach((shift, i) => {
      if (shift.includes(":")) {
        shift = Number(shift.split(":")[0])
      }
      if (typeof shift === 'number') {
        let obj = {
          day: i,
          startHour: shift
        };
        this.workShift.push(obj)
      }
    })
  }
  shift() {
    return this.workShift;
  }
}

function makeShifts() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("shifts");
  let data = sheet.getRange("A2:I").getDisplayValues();

  let week = new WeekArray();

  for (let i = 0; i < data.length && data[i][0] !== ''; i++) {
    let agent = new Agent(data[i])
    week.addShifts(agent.shift());
  }
  let summary = transpose(week.summary());
  ss.getSheetByName("output").getRange(2,2,summary.length,summary[0].length).setValues(summary);

}

function transpose(data) {
    return data[0].map((_, c) => data.map((r) => r[c] ));
}