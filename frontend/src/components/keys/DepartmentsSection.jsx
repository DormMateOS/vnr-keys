import { useMemo } from "react";
import DepartmentCard from "./DepartmentCard";

const DEPARTMENTS = [
	{ value: "CSE", label: "CSE" },
	{ value: "EEE", label: "EEE" },
	{ value: "AIML", label: "AIML" },
	{ value: "IoT", label: "IoT" },
	// { value : "CSE_DS", label : "CYS,DS and AI&DS"},
	// { value : "CSE_CYS", label : "CYS,DS and AI&DS"},
	{ value : "CSE_AIDS", label : "CYS,DS and AI&DS"},
	{ value: "ECE", label: "ECE" },
	{ value: "MECH", label: "MECH" },
	{ value: "CIVIL", label: "CIVIL" },
	{ value: "IT", label: "IT" },
	{ value: "ADMIN", label: "ADMIN" },
	{ value: "RESEARCH", label: "RESEARCH" },
	{ value: "COMMON", label: "COMMON" }
];

const DepartmentsSection = ({ keys, onDepartmentClick, selectedDepartment }) => {
	const counts = useMemo(() => {
		const map = {};
		for (const dept of DEPARTMENTS) map[dept.value] = 0;
		for (const key of keys) {
			const dept = key.department;
			if (dept && Object.prototype.hasOwnProperty.call(map, dept)) map[dept] += 1;
		}
		return map;
	}, [keys]);

	return (
		<div className="mb-8">
			<h3 className="text-lg font-semibold text-white mb-4">Departments</h3>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{DEPARTMENTS.map(({ value, label }) => (
					<DepartmentCard
						key={value}
						department={label}
						keyCount={counts[value] || 0}
						onClick={() => onDepartmentClick(value)}
						isSelected={selectedDepartment === value}
					/>
				))}
			</div>
		</div>
	);
};

export default DepartmentsSection;
