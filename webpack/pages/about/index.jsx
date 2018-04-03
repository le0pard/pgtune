import React from 'react'

import './about.sass'

export default class AboutPage extends React.Component {
  render() {
    return (
      <div className="about-page">
        <p>
          <strong>PGTune</strong> calculate configuration for PostgreSQL based on the maximum performance for a given hardware configuration. It isn't a <a href="https://en.wikipedia.org/wiki/No_Silver_Bullet">silver bullet</a> for the optimization settings of PostgreSQL. Many settings depend not only on the hardware configuration, but also on the size of the database, the number of clients and the complexity of queries, so that optimally configure the database can only be given all these parameters.
        </p>
      </div>
    )
  }
}
