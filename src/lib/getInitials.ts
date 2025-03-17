export const getInitials = (name: string): string => {
  if ("Anonymous" === name) {
    return "AN";
  }
  const splittedName = name.split(" ");
  if (splittedName.length === 1) {
    // name has only one word, return the first letter
    return splittedName[0].charAt(0).toLocaleUpperCase();
  }
  const firstInitial = splittedName[0].charAt(0);
  const lastInitial = splittedName[splittedName.length - 1].charAt(0);
  return (firstInitial + lastInitial).toLocaleUpperCase();
};
