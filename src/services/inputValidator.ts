export function isValidBranchName(branchName: string): boolean {
  if (!branchName || branchName.trim() !== branchName) {
    return false;
  }
  // Forbidden characters: space, ~, ^, :, ?, *, [, \, @, &, |, ;, ", ', <, >
  const forbiddenChars = /[\s~^:?*\[\\@&|;"'<>]/;
  if (forbiddenChars.test(branchName)) {
    return false;
  }
  if (branchName.includes("..") || branchName.includes("//") || branchName.includes("@{")) {
    return false;
  }
  if (branchName.startsWith("/") || branchName.endsWith("/")) {
    return false;
  }
  if (branchName.startsWith(".") || branchName.endsWith(".")) {
    return false;
  }
  if (branchName.endsWith(".lock")) {
    return false;
  }
  return true;
}

export function isValidRepoUrl(url: string): boolean {
  if (!url) {
    return false;
  }
  // HTTPS URL matching: https://(domain)/(owner)/(repo)(.git)?
  // SSH URL matching: git@(domain):(owner)/(repo)(.git)?
  const httpsRegex = /^https:\/\/[a-zA-Z0-9\-._~%!$&'()*+,;=]+@?[a-zA-Z0-9\-._~%!$&'()*+,;=]+(?::\d+)?(?:\/[a-zA-Z0-9\-._~%]+){2,}(\.git)?\/?$/;
  const sshRegex = /^git@[a-zA-Z0-9\-._~%!$&'()*+,;=]+:[a-zA-Z0-9\-._~%]+\/[a-zA-Z0-9\-._~%]+(\.git)?\/?$/;
  return httpsRegex.test(url) || sshRegex.test(url);
}

export function isValidProblemName(name: string): boolean {
  if (!name) {
    return false;
  }
  const forbidden = /["'&|><;]/;
  return !forbidden.test(name);
}
