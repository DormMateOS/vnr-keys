// Utility functions for formatting key-related data

/**
 * Get display label for category
 */
export const getCategoryLabel = (category) => {
  const categoryMap = {
    'classroom': 'Classroom',
    'lab': 'Laboratory',
    'office': 'Office',
    'storage': 'Storage',
    'library': 'Library',
    'auditorium': 'Auditorium',
    'cafeteria': 'Cafeteria',
    'hostel': 'Hostel',
    'maintenance': 'Maintenance',
    'security': 'Security',
    'other': 'Other'
  };
  return categoryMap[category] || category;
};

/**
 * Get display label for block
 */
export const getBlockLabel = (block) => {
  const blockMap = {
    'A': 'A Block',
    'B': 'B Block',
    'C': 'C Block',
    'D': 'D Block',
    'E': 'E Block',
    'F': 'F Block',
    'G': 'G Block',
    'H': 'H Block',
    'PG': 'PG Block',
    'MAIN': 'Main Building',
    'LIB': 'Library',
    'AUD': 'Auditorium',
    'CAF': 'Cafeteria',
    'HOSTEL': 'Hostel',
    'OTHER': 'Other'
  };
  return blockMap[block] || block;
};

/**
 * Get block information with description
 */
export const getBlockInfo = (block) => {
  const blockInfoMap = {
    'A': { name: 'A Block', description: 'Computer Science & Storage' },
    'B': { name: 'B Block', description: 'Physics & Chemistry Labs' },
    'C': { name: 'C Block', description: 'Biology & Research' },
    'D': { name: 'D Block', description: 'Library & Study Rooms' },
    'E': { name: 'E Block', description: 'Administration & Faculty' },
    'F': { name: 'F Block', description: 'Engineering Labs' },
    'G': { name: 'G Block', description: 'Workshops & Labs' },
    'H': { name: 'H Block', description: 'Research & Development' },
    'PG': { name: 'PG Block', description: 'Auditorium & Seminar Halls' },
    'MAIN': { name: 'Main Building', description: 'Administration & Offices' },
    'LIB': { name: 'Library', description: 'Library & Reading Rooms' },
    'AUD': { name: 'Auditorium', description: 'Auditorium & Event Halls' },
    'CAF': { name: 'Cafeteria', description: 'Cafeteria & Dining' },
    'HOSTEL': { name: 'Hostel', description: 'Hostel & Accommodation' },
    'OTHER': { name: 'Other', description: 'Other Facilities' }
  };
  return blockInfoMap[block] || { name: block, description: 'Other Facilities' };
};

/**
 * Get department label
 */
export const getDepartmentLabel = (department) => {
  const departmentMap = {
    'CSE': 'Computer Science Engineering',
    'EEE': 'Electrical and Electronics Engineering',
    'CSE_AIDS' : 'CSE - (CYS,DS) and AI&DS',
    'CSE_CYS' : 'CSE - (CYS,DS) and AI&DS',
    'CSE_DS' : 'CSE - (CYS,DS) and AI&DS',
    'AIML': 'Artificial Intelligence and Machine Learning',
    'IoT': 'Internet of Things',
    'ECE': 'Electronics and Communication Engineering',
    'MECH': 'Mechanical Engineering',
    'CIVIL': 'Civil Engineering',
    'IT': 'Information Technology',
    'ADMIN': 'Administration',
    'RESEARCH': 'Research Department',
    'COMMON': 'Common (All Departments)'
  };
  return departmentMap[department] || department;
};
