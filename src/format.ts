export function buildGitLabComment(sonarUrl: string, issuesText: string): string {
  return [
    '## SonarQube Analysis Results',
    '',
    `[View Analysis on SonarQube](${sonarUrl})`,
    '',
    '### Issues Found',
    '',
    '```',
    issuesText,
    '```'
  ].join('\n')
}