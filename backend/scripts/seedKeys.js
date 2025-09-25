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
    "keyName": ["E401"],
    "location": "4th Floor - Block E",
    "description": "Database Management Systems Laboratory",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E402"],
    "location": "4th Floor - Block E",
    "description": "Big Data Computing Laboratory",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E403"],
    "location": "4th Floor - Block E",
    "description": "Programming for Problem Solving Laboratory",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E404"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E405"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E406"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E407"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E408"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E409"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E410"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E411"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E412"],
    "location": "4th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E413"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E414"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E415"],
    "location": "4th Floor - Block E",
    "description": "New Table Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E416"],
    "location": "4th Floor - Block E",
    "description": "New Table Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E417"],
    "location": "4th Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E418"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E419"],
    "location": "4th Floor - Block E",
    "description": "Tutorial Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E420"],
    "location": "4th Floor - Block E",
    "description": "Library Room",
    "category": "library",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E421"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E422"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E423"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E424"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E425"],
    "location": "4th Floor - Block E",
    "description": "HOD Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E426"],
    "location": "4th Floor - Block E",
    "description": "Tutorial Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E427"],
    "location": "4th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E428"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E429"],
    "location": "4th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E430"],
    "location": "4th Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E431"],
    "location": "4th Floor - Block E",
    "description": "Lab",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E432"],
    "location": "4th Floor - Block E",
    "description": "Department Meeting Hall",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E433"],
    "location": "4th Floor - Block E",
    "description": "Department Meeting Hall",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E434"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E435"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E436"],
    "location": "4th Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E437"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E438"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E439"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E440"],
    "location": "4th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E501"],
    "location": "5th Floor - Block E",
    "description": "Web Technologies Laboratory",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E502"],
    "location": "5th Floor - Block E",
    "description": "Operating Systems and Computer Networks Laboratory",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E503"],
    "location": "5th Floor - Block E",
    "description": "Java Laboratory",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E504"],
    "location": "5th Floor - Block E",
    "description": "Data Visualization Laboratory",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E505"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E506"],
    "location": "5th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E507"],
    "location": "5th Floor - Block E",
    "description": "Design Teaching Lab",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E508"],
    "location": "5th Floor - Block E",
    "description": "Design Teaching Lab",
    "category": "lab",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E509"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E510"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E511"],
    "location": "5th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E512"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E513"],
    "location": "5th Floor - Block E",
    "description": "Wash Room",
    "category": "other",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E516"],
    "location": "5th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E517"],
    "location": "5th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E518"],
    "location": "5th Floor - Block E",
    "description": "Panel Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E519"],
    "location": "5th Floor - Block E",
    "description": "Staff Room",
    "category": "office",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E522"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E523"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E524"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E525"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E526"],
    "location": "5th Floor - Block E",
    "description": "Class Room",
    "category": "classroom",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  },
  {
    "keyNumber": "1",
    "keyName": ["E527"],
    "location": "5th Floor - Block E",
    "description": "Seminar Hall",
    "category": "auditorium",
    "department": "CSE-(CYS,DS) and AI&DS",
    "frequentlyUsed": false
  }
]

// Transform the data to fix keyName arrays and department values
const transformedKeys = sampleKeys.map((key, index) => {
  const keyName = Array.isArray(key.keyName) ? key.keyName.join('/') : key.keyName;
  const location = key.location.replace(/\s+/g, '_').replace(/-/g, '_');
  return {
    ...key,
    keyNumber: `${keyName}_${location}_${index}`, // Make unique with location and index
    keyName: keyName,
    department: key.department === 'class' ? 'COMMON' : 
              key.department === 'Students' ? 'COMMON' :
              key.department === 'SSC' ? 'ADMIN' :
              key.department === 'Transport' ? 'ADMIN' :
              key.department === 'KS' ? 'ADMIN' :
              key.department === 'ENG' ? 'COMMON' :
              key.department === 'Staff' ? 'ADMIN' :
              key.department === 'H&S' ? 'COMMON' :
              key.department === 'maths' ? 'COMMON' :
              key.department === 'physics' ? 'COMMON' :
              key.department === 'ALFago' ? 'COMMON' :
              key.department === '.' ? 'COMMON' :
              key.department === '-' ? 'COMMON' :
              key.department === 'No' ? 'COMMON' :
              key.department === null ? 'COMMON' :
              key.department === 'EIE' ? 'EEE' :
              key.department === 'ME' ? 'MECH' :
              key.department || 'COMMON',
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
