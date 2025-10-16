import mongoose from "mongoose";
import dotenv from "dotenv";
import Key from "../models/key.model.js";

dotenv.config();

const sampleKeys = [
  {
    "keyNumber": "1",
    "keyName": ["A001"],
    "location": "Ground Floor - Block A",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A002"],
    "location": "Ground Floor - Block A",
    "description": "Staff Room",
    "category": "classroom",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A003"],
    "location": "Ground Floor - Block A",
    "description": "SSC",
    "category": "facility",
    "department": "SSC",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A004"],
    "location": "Ground Floor - Block A",
    "description": "Library",
    "category": "facility",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A005"],
    "location": "Ground Floor - Block A",
    "description": "Students Gores",
    "category": "facility",
    "department": "Students",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A006", "A009"],
    "location": "Ground Floor - Block A",
    "description": "MT Lab Workshop",
    "category": "lab",
    "department": "ME",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A007", "A008"],
    "location": "Ground Floor - Block A",
    "description": "Workshop-1",
    "category": "lab",
    "department": "ME",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A010"],
    "location": "Ground Floor - Block A",
    "description": "Staff Room",
    "category": "classroom",
    "department": "ME",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A011"],
    "location": "Ground Floor - Block A",
    "description": "Washroom",
    "category": "facility",
    "department": "No",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A012"],
    "location": "Ground Floor - Block A",
    "description": "FM Lab Workshop-2",
    "category": "lab",
    "department": "ME",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A013"],
    "location": "Ground Floor - Block A",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B001"],
    "location": "Ground Floor - Block B",
    "description": "",
    "category": "facility",
    "department": ".",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B002"],
    "location": "Ground Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "ENG",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B003"],
    "location": "Ground Floor - Block B",
    "description": "HOD Room",
    "category": "classroom",
    "department": "ENG",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B004"],
    "location": "Ground Floor - Block B",
    "description": "BEE Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B005", "B006"],
    "location": "Ground Floor - Block B",
    "description": "EM Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B007", "B008"],
    "location": "Ground Floor - Block B",
    "description": "TE Lab",
    "category": "lab",
    "department": "ME",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B009", "B010"],
    "location": "Ground Floor - Block B",
    "description": "Washroom",
    "category": "facility",
    "department": "-",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B011"],
    "location": "Ground Floor - Block B",
    "description": "Seminar Hall",
    "category": "facility",
    "department": "-",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C001"],
    "location": "Ground Floor - Block C",
    "description": "KS' Audioum",
    "category": "facility",
    "department": "KS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C002"],
    "location": "Ground Floor - Block C",
    "description": "Penal Room",
    "category": "facility",
    "department": "-",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C003"],
    "location": "Ground Floor - Block C",
    "description": "Transport Office",
    "category": "facility",
    "department": "Transport",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C004"],
    "location": "Ground Floor - Block C",
    "description": "Lunch Room",
    "category": "facility",
    "department": "-",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C005", "C006"],
    "location": "Ground Floor - Block C",
    "description": "Washroom",
    "category": "facility",
    "department": "-",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C007", "C008"],
    "location": "Ground Floor - Block C",
    "description": "Engineering Lab Workshop-II",
    "category": "lab",
    "department": "ME",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A101"],
    "location": "First Floor - Block A",
    "description": "Staff Room",
    "category": "classroom",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A102"],
    "location": "First Floor - Block A",
    "description": "COE Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A103"],
    "location": "First Floor - Block A",
    "description": "Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A104", "A105"],
    "location": "First Floor - Block A",
    "description": "Washroom",
    "category": "facility",
    "department": "COMMON",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A106"],
    "location": "First Floor - Block A",
    "description": "Control Room",
    "category": "classroom",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A107"],
    "location": "First Floor - Block A",
    "description": "Panel Room",
    "category": "classroom",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A108"],
    "location": "First Floor - Block A",
    "description": "OOP Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A109", "A110"],
    "location": "First Floor - Block A",
    "description": "Computer Graphics Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A111"],
    "location": "First Floor - Block A",
    "description": "ITWS Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A112"],
    "location": "First Floor - Block A",
    "description": "SE Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A113"],
    "location": "First Floor - Block A",
    "description": "TP Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A114"],
    "location": "First Floor - Block A",
    "description": "ML Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A115", "A116"],
    "location": "First Floor - Block A",
    "description": "Washroom",
    "category": "facility",
    "department": "COMMON",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A117"],
    "location": "First Floor - Block A",
    "description": "ECS Lab",
    "category": "lab",
    "department": "ENG",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A118"],
    "location": "First Floor - Block A",
    "description": "ECS Lab",
    "category": "lab",
    "department": "ENG",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C105"],
    "location": "First Floor - Block C",
    "description": "ED & EN Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C106"],
    "location": "First Floor - Block C",
    "description": "DM Lab",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B107"],
    "location": "First Floor - Block B",
    "description": "CNCC",
    "category": "lab",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A201"],
    "location": "Second Floor - Block A",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A202"],
    "location": "Second Floor - Block A",
    "description": "EDE Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A203"],
    "location": "Second Floor - Block A",
    "description": "ADC Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A204", "A205"],
    "location": "Second Floor - Block A",
    "description": "Washroom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A206"],
    "location": "Second Floor - Block A",
    "description": "empmc Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A207"],
    "location": "Second Floor - Block A",
    "description": "ADC Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A208"],
    "location": "Second Floor - Block A",
    "description": "VLSI Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A209"],
    "location": "Second Floor - Block A",
    "description": "CN Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A210", "A211"],
    "location": "Second Floor - Block A",
    "description": "Washroom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A212"],
    "location": "Second Floor - Block A",
    "description": "Fainloing Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A213"],
    "location": "Second Floor - Block A",
    "description": "PGI Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B201"],
    "location": "Second Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B202"],
    "location": "Second Floor - Block B",
    "description": "HOD Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B203"],
    "location": "Second Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B204"],
    "location": "Second Floor - Block B",
    "description": "pendal Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B205"],
    "location": "Second Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B206"],
    "location": "Second Floor - Block B",
    "description": "Transfor Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B207"],
    "location": "Second Floor - Block B",
    "description": "PCA Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B208"],
    "location": "Second Floor - Block B",
    "description": "AI Lab",
    "category": "lab",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B209"],
    "location": "Second Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B210", "B211"],
    "location": "Second Floor - Block B",
    "description": "Washroom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B212"],
    "location": "Second Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B213"],
    "location": "Second Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B214"],
    "location": "Second Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B215"],
    "location": "Second Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B216"],
    "location": "Second Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B217"],
    "location": "Second Floor - Block B",
    "description": "Staf Room",
    "category": "classroom",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B218"],
    "location": "Second Floor - Block B",
    "description": "HOD Room",
    "category": "classroom",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B219"],
    "location": "Second Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B220"],
    "location": "Second Floor - Block B",
    "description": "Libary Room",
    "category": "classroom",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B221"],
    "location": "Second Floor - Block B",
    "description": "IQAC",
    "category": "facility",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B222"],
    "location": "Second Floor - Block B",
    "description": "Libirary Room",
    "category": "classroom",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C201"],
    "location": "Second Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C202"],
    "location": "Second Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C203"],
    "location": "Second Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C204"],
    "location": "Second Floor - Block C",
    "description": "NI Academy Lab",
    "category": "lab",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C205"],
    "location": "Second Floor - Block C",
    "description": "MPMC Lab",
    "category": "lab",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C206"],
    "location": "Second Floor - Block C",
    "description": "EVC/PDC Lab",
    "category": "lab",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C207"],
    "location": "Second Floor - Block C",
    "description": "MICROware",
    "category": "facility",
    "department": "ECE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C208"],
    "location": "Second Floor - Block C",
    "description": "DSP Lab",
    "category": "lab",
    "department": "EIE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C209"],
    "location": "Second Floor - Block C",
    "description": "Staff Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C210"],
    "location": "Second Floor - Block C",
    "description": "Staff Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C211", "C212"],
    "location": "Second Floor - Block C",
    "description": "Washroom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C213"],
    "location": "Second Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C214"],
    "location": "Second Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C301"],
    "location": "Third Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C302"],
    "location": "Third Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C303"],
    "location": "Third Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C304"],
    "location": "Third Floor - Block C",
    "description": "AP E&Pcs physics Lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C305"],
    "location": "Third Floor - Block C",
    "description": "Applied Eng Lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C306"],
    "location": "Third Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C307"],
    "location": "Third Floor - Block C",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C308"],
    "location": "Third Floor - Block C",
    "description": "Applied physics Lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C309"],
    "location": "Third Floor - Block C",
    "description": "Chemistry Staff Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C310"],
    "location": "Third Floor - Block C",
    "description": "mathes Staff Room",
    "category": "classroom",
    "department": "maths",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C311", "C312"],
    "location": "Third Floor - Block C",
    "description": "washroom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C313"],
    "location": "Third Floor - Block C",
    "description": "Chemistry lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["C314"],
    "location": "Third Floor - Block C",
    "description": "Class Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A301"],
    "location": "Third Floor - Block A",
    "description": "class Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A302"],
    "location": "Third Floor - Block A",
    "description": "class Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A303"],
    "location": "Third Floor - Block A",
    "description": "class Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A304", "A305"],
    "location": "Third Floor - Block A",
    "description": "washroom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A306"],
    "location": "Third Floor - Block A",
    "description": "MPMC Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A307"],
    "location": "Third Floor - Block A",
    "description": "PS Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A308"],
    "location": "Third Floor - Block A",
    "description": "NT Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A309"],
    "location": "Third Floor - Block A",
    "description": "cs Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A310"],
    "location": "Third Floor - Block A",
    "description": "Ems Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A311", "A312"],
    "location": "Third Floor - Block A",
    "description": "WasRoom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A313"],
    "location": "Third Floor - Block A",
    "description": "PE Lab",
    "category": "lab",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["A314"],
    "location": "Third Floor - Block A",
    "description": "Physics Lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B301"],
    "location": "Third Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B302"],
    "location": "Third Floor - Block B",
    "description": "HOD Room",
    "category": "classroom",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B303"],
    "location": "Third Floor - Block B",
    "description": "faculty Room",
    "category": "classroom",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B304"],
    "location": "Third Floor - Block B",
    "description": "Penal Room",
    "category": "classroom",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B305"],
    "location": "Third Floor - Block B",
    "description": "faculty Room",
    "category": "classroom",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B306"],
    "location": "Third Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B307"],
    "location": "Third Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B308"],
    "location": "Third Floor - Block B",
    "description": "Chemistry Lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B309"],
    "location": "Third Floor - Block B",
    "description": "Chemistry Lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B310", "B311"],
    "location": "Third Floor - Block B",
    "description": "washroom",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B313"],
    "location": "Third Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B314", "B315", "B316", "B317"],
    "location": "Third Floor - Block B",
    "description": "oneling Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B318"],
    "location": "Third Floor - Block B",
    "description": "Discussion Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B319"],
    "location": "Third Floor - Block B",
    "description": "HOD Chemistry",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B320"],
    "location": "3th Floor - Block B",
    "description": "faculty Room",
    "category": "classroom",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B321"],
    "location": "3th Floor - Block B",
    "description": "IC Applian Lab",
    "category": "lab",
    "department": "H&S",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B322"],
    "location": "3th Floor - Block B",
    "description": "Libarary",
    "category": "facility",
    "department": "EEE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B401"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B402"],
    "location": "4th Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "Staff",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B403"],
    "location": "4th Floor - Block B",
    "description": "AECS Lab",
    "category": "lab",
    "department": "ENG",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B404"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B405"],
    "location": "4th Floor - Block B",
    "description": "AECS Lab",
    "category": "lab",
    "department": "ENG",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B406"],
    "location": "4th Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "IT",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B407"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B408"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B409/410"],
    "location": "4th Floor - Block B",
    "description": "wash Room",
    "category": "facility",
    "department": null,
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B411"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B412"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B413"],
    "location": "4th Floor - Block B",
    "description": "Reching LLP",
    "category": "facility",
    "department": "ALFago",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B414"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B415"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B416"],
    "location": "4th Floor - Block B",
    "description": "class Room",
    "category": "classroom",
    "department": "class",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B417"],
    "location": "4th Floor - Block B",
    "description": "Physics HOD",
    "category": "classroom",
    "department": "physics",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B418"],
    "location": "4th Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "physics",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B419"],
    "location": "4th Floor - Block B",
    "description": "mathes HOD",
    "category": "classroom",
    "department": "maths",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["B420"],
    "location": "4th Floor - Block B",
    "description": "Staff Room",
    "category": "classroom",
    "department": "maths",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E001"],
    "location": "Ground Floor - Block E",
    "description": "Database Management Systems Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E002"],
    "location": "Ground Floor - Block E",
    "description": "Data Mining and Analytics Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E003"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E004"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E005"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E006"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E007"],
    "location": "Ground Floor - Block E",
    "description": "Washroom",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E008"],
    "location": "Ground Floor - Block E",
    "description": "Washroom",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E009"],
    "location": "Ground Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E010"],
    "location": "Ground Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E011"],
    "location": "Ground Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E012"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E013"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E014"],
    "location": "Ground Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E015"],
    "location": "Ground Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E016"],
    "location": "Ground Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E017"],
    "location": "Ground Floor - Block E",
    "description": "Store Room",
    "category": "storage",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E018"],
    "location": "Ground Floor - Block E",
    "description": "MTECH Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E019"],
    "location": "Ground Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E020"],
    "location": "Ground Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E021"],
    "location": "Ground Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E022"],
    "location": "Ground Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E023"],
    "location": "Ground Floor - Block E",
    "description": "Store Room",
    "category": "storage",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E024"],
    "location": "Ground Floor - Block E",
    "description": "Tutorial Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E025"],
    "location": "Ground Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E026"],
    "location": "Ground Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E027"],
    "location": "Ground Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E028"],
    "location": "Ground Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E029"],
    "location": "Ground Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E030"],
    "location": "Ground Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E031"],
    "location": "Ground Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E032"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E033"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E034"],
    "location": "Ground Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E035"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E036"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E037"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E038"],
    "location": "Ground Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E101"],
    "location": "1st Floor - Block E",
    "description": "Artificial Intelligence Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E102"],
    "location": "1st Floor - Block E",
    "description": "Computer Network Laboratory",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E103"],
    "location": "1st Floor - Block E",
    "description": "Software Design using UML",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E104"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E105"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E106"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E107"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E108"],
    "location": "1st Floor - Block E",
    "description": "Washroom",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E109"],
    "location": "1st Floor - Block E",
    "description": "Washroom",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E110"],
    "location": "1st Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E111"],
    "location": "1st Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E112"],
    "location": "1st Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E113"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E114"],
    "location": "1st Floor - Block E",
    "description": "Class Room But No Board",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E115"],
    "location": "1st Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E116"],
    "location": "1st Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E117"],
    "location": "1st Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E118"],
    "location": "1st Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E119"],
    "location": "1st Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E120"],
    "location": "1st Floor - Block E",
    "description": "Library Room",
    "category": "library",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E121"],
    "location": "1st Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E122"],
    "location": "1st Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E123"],
    "location": "1st Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E124"],
    "location": "1st Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E125"],
    "location": "1st Floor - Block E",
    "description": "HOD Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E126"],
    "location": "1st Floor - Block E",
    "description": "Tutorial Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E127"],
    "location": "1st Floor - Block E",
    "description": "Corporate Room, Department Meeting Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E128"],
    "location": "1st Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E129"],
    "location": "1st Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E130"],
    "location": "1st Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E131"],
    "location": "1st Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E132"],
    "location": "1st Floor - Block E",
    "description": "Department Meeting Room Hall",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E133"],
    "location": "1st Floor - Block E",
    "description": "Department Meeting Room Hall",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E134"],
    "location": "1st Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E135"],
    "location": "1st Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E136"],
    "location": "1st Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E137"],
    "location": "1st Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E138"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E139"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E140"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E141"],
    "location": "1st Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E201"],
    "location": "2nd Floor - Block E",
    "description": "Data Engineering Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E202"],
    "location": "2nd Floor - Block E",
    "description": "Image Processing and Computer Vision Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E203"],
    "location": "2nd Floor - Block E",
    "description": "Occupancy Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E204"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E205"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E206"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E207"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E208"],
    "location": "2nd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E209"],
    "location": "2nd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E210"],
    "location": "2nd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E211"],
    "location": "2nd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E212"],
    "location": "2nd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E213"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E214"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E215"],
    "location": "2nd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E216"],
    "location": "2nd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E217"],
    "location": "2nd Floor - Block E",
    "description": "Programming for Problem Solving Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E218"],
    "location": "2nd Floor - Block E",
    "description": "Camera - C.C.T.V Room",
    "category": "security",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E219"],
    "location": "2nd Floor - Block E",
    "description": "Tutorial Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E220"],
    "location": "2nd Floor - Block E",
    "description": "Library Room",
    "category": "library",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E221"],
    "location": "2nd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E222"],
    "location": "2nd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E223"],
    "location": "2nd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E224"],
    "location": "2nd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E225"],
    "location": "2nd Floor - Block E",
    "description": "HOD Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E226"],
    "location": "2nd Floor - Block E",
    "description": "Store Room",
    "category": "storage",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E227"],
    "location": "2nd Floor - Block E",
    "description": "Corporate Meeting Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E228"],
    "location": "2nd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E229"],
    "location": "2nd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E230"],
    "location": "2nd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E231"],
    "location": "2nd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E232"],
    "location": "2nd Floor - Block E",
    "description": "Department Meeting Hall Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E233"],
    "location": "2nd Floor - Block E",
    "description": "Department Meeting Hall Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E234"],
    "location": "2nd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E235"],
    "location": "2nd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E236"],
    "location": "2nd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E237"],
    "location": "2nd Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E238"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E239"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E240"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E241"],
    "location": "2nd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E301"],
    "location": "3rd Floor - Block E",
    "description": "Devops Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E302"],
    "location": "3rd Floor - Block E",
    "description": "Natural Language Processing Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E303"],
    "location": "3rd Floor - Block E",
    "description": "Embedded GPU Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E304"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E305"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E306"],
    "location": "3rd Floor - Block E",
    "description": "D.B.M.S. M. L",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E307"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E308"],
    "location": "3rd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E309"],
    "location": "3rd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E310"],
    "location": "3rd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E311"],
    "location": "3rd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E312"],
    "location": "3rd Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E313"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E314"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E315"],
    "location": "3rd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E316"],
    "location": "3rd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E317"],
    "location": "3rd Floor - Block E",
    "description": "Programming for Problem Solving Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E318"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E319"],
    "location": "3rd Floor - Block E",
    "description": "Tutorial Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E320"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E321"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E322"],
    "location": "3rd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E323"],
    "location": "3rd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E324"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E325"],
    "location": "3rd Floor - Block E",
    "description": "Store Room",
    "category": "storage",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E326"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E327"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E328"],
    "location": "3rd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E329"],
    "location": "3rd Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E330"],
    "location": "3rd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E331"],
    "location": "3rd Floor - Block E",
    "description": "Programming for Problem Solving Laboratory",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E332"],
    "location": "3rd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E333"],
    "location": "3rd Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E334"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room and Lab",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E335"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E336"],
    "location": "3rd Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E337"],
    "location": "3rd Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E338"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E339"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E340"],
    "location": "3rd Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E341"],
    "location": "3rd Floor - Block E",
    "description": "M.TECH CSE & SE Lab",
    "category": "lab",
    "department": "AIML",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E401"],
    "location": "4th Floor - Block E",
    "description": "Database Management Systems Laboratory",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E402"],
    "location": "4th Floor - Block E",
    "description": "Big Data Computing Laboratory",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E403"],
    "location": "4th Floor - Block E",
    "description": "Programming for Problem Solving Laboratory",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E404"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E405"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E406"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E407"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E408"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E409"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E410"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E411"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E412"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E413"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E414"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E415"],
    "location": "4th Floor - Block E",
    "description": "New Table Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E416"],
    "location": "4th Floor - Block E",
    "description": "New Table Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E417"],
    "location": "4th Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E418"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E419"],
    "location": "4th Floor - Block E",
    "description": "Tutorial Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E420"],
    "location": "4th Floor - Block E",
    "description": "Library Room",
    "category": "library",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E421"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E422"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E423"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E424"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E425"],
    "location": "4th Floor - Block E",
    "description": "HOD Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E426"],
    "location": "4th Floor - Block E",
    "description": "Tutorial Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E427"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E428"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E429"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E430"],
    "location": "4th Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E431"],
    "location": "4th Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E432"],
    "location": "4th Floor - Block E",
    "description": "Department Meeting Hall",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E433"],
    "location": "4th Floor - Block E",
    "description": "Department Meeting Hall",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E434"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E435"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E436"],
    "location": "4th Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E437"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E438"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E439"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E440"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E501"],
    "location": "5th Floor - Block E",
    "description": "Web Technologies Laboratory",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E502"],
    "location": "5th Floor - Block E",
    "description": "Operating Systems and Computer Networks Laboratory",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E503"],
    "location": "5th Floor - Block E",
    "description": "Java Laboratory",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E504"],
    "location": "5th Floor - Block E",
    "description": "Data Visualization Laboratory",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E505"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E506"],
    "location": "5th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E507"],
    "location": "5th Floor - Block E",
    "description": "Design Teaching Lab",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E508"],
    "location": "5th Floor - Block E",
    "description": "Design Teaching Lab",
    "category": "lab",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E509"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E510"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E511"],
    "location": "5th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E512"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E513"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E516"],
    "location": "5th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E517"],
    "location": "5th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E518"],
    "location": "5th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E519"],
    "location": "5th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E522"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E523"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E524"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E525"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E526"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E527"],
    "location": "5th Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "CSE_AIDS",
    "frequentlyUsed": false
  }
]

// Transform the data to fix keyName arrays and department values
const transformedKeys = sampleKeys.map((key, index) => {
  const keyName = Array.isArray(key.keyName) ? key.keyName.join(',') : key.keyName;
  return {
    ...key,
    keyNumber: keyName, // Use the original keyName as keyNumber (e.g., "E001", "E002", "E101")
    keyName: keyName,
    // Normalize department to match enum values in key.model.js
    department: (() => {
      const d = (key.department || '').toString().trim();
      if (!d || d === 'class' || d === 'Students' || d === '.' || d === '-' || d === 'No') return 'COMMON';
      const map = {
        'SSC': 'ADMIN',
        'Transport': 'ADMIN',
        'KS': 'ADMIN',
        'Staff': 'ADMIN',
        'ENG': 'COMMON',
        'H&S': 'COMMON',
        'maths': 'COMMON',
        'physics': 'COMMON',
        'ALFago': 'COMMON',
        'EIE': 'EEE',
        'ME': 'MECH',
        'IT': 'IT',
        'CSE': 'CSE',
        'ECE': 'ECE',
        'AIML': 'AIML',
        'IoT': 'IoT',
        'CIVIL': 'CIVIL',
        'ADMIN': 'ADMIN',
      };

      // Common messy variants mapping
      const normalized = d
        .replace(/&/g, 'AND')
        .replace(/[()]/g, '')
        .replace(/\s+/g, '')
        .toUpperCase();

      // Handle CSE combined variants like CSE_AIDS
      if (normalized.startsWith('CSE')) {
        // Normalize all CSE-related variants to the single frontend-supported enum
        // so department cards/counts align with the UI which shows CYS, DS and AI&DS
        if (normalized.includes('CYS') || normalized.includes('DS') || normalized.includes('AIDS') || normalized.includes('AI')) return 'CSE_AIDS';
        return 'CSE';
      }

      // Direct map check
      if (map[normalized]) return map[normalized];

      // If normalized contains key tokens
      if (normalized.includes('AIML') || normalized.includes('AI')) return 'AIML';
      if (normalized.includes('EEE')) return 'EEE';
      if (normalized.includes('ME')) return 'MECH';

      // Fallback to COMMON to avoid failing schema validation
      return 'COMMON';
    })(),
    category: key.category === 'facility' ? 'other' : key.category
  };
});

const seedKeys = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Clear existing keys
    console.log("Clearing existing keys...");
    await Key.deleteMany({});
    console.log("Existing keys cleared");
    console.log(process.env.MONGO_URI)
    // Insert sample keys
    console.log("Inserting transformed keys...");
    const insertedKeys = await Key.insertMany(transformedKeys);
    console.log(`${insertedKeys.length} keys inserted successfully`);

    // Display inserted keys
    console.log("\nInserted Keys:");
    insertedKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.keyNumber} - ${key.keyName} (${key.location})`);
    });

    console.log("\n✅ Key seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding keys:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Run the seed function
seedKeys();
