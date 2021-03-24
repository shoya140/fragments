export default {
  repository: null, // project repo
  docsRepository: null, // docs repo
  branch: 'master', // branch of docs
  path: '/', // path of docs
  titleSuffix: null,
  nextLinks: true,
  prevLinks: true,
  search: true,
  UNSTABLE_stork: true,
  darkMode: true,
  footer: false,
  footerText: '2021 © Shoya Ishimaru',
  footerEditOnGitHubLink: true, // will link to the docs repo
  logo: <>
    {/* <svg>...</svg> */}
    <strong>Fragments</strong>
  </>,
  head: <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Fragments: weekly updates by shoya140" />
    <meta name="og:title" content="Fragments: weekly updates by shoya140" />
  </>
}