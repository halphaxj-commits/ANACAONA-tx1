const ScoutRoles = (() => {
  const UNIT_ROLES = [
    'Meutre x-12ans',
    'Troup 12-17ans',
    'Rout 18-23ans',
    'Commissaire district',
    'AG',
    'Chef',
    'Cheftainne',
    '1Cp',
    'Cp',
    'Sp'
  ];
  const ACCESS_LABELS = { member: 'Membre', leader: 'Leader', admin: 'Admin' };
  function unitOptions(selected='Sp') {
    return UNIT_ROLES.map(r => `<option value="${Utils.esc(r)}" ${r===selected?'selected':''}>${Utils.esc(r)}</option>`).join('');
  }
  function accessLabel(role) { return ACCESS_LABELS[role] || 'Membre'; }
  function unitLabel(role) { return UNIT_ROLES.includes(role) ? role : 'Sp'; }
  function isPrivileged(role) { return role === 'leader' || role === 'admin'; }
  return { UNIT_ROLES, unitOptions, accessLabel, unitLabel, isPrivileged };
})();
