import React from 'react';

const UserTable = ({ users, onSelectUser }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Farmer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Location
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Level
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              XP
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Missions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr 
              key={user._id} 
              onClick={() => onSelectUser && onSelectUser(user)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.village}, {user.district}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="badge badge-secondary">Lv {user.level}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-primary-700">
                {user.xp}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                {user.completedMissions?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
