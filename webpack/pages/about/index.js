import React from 'react'
import Logo from './logo.svg'

import './about.sass'

const AboutPage = () => (
  <div className="about-page">
    <img className="about-page-logo" src={Logo} alt="PGTune" />
    <p>
      <strong>PGTune</strong> calculate configuration for PostgreSQL based on the maximum performance for a given hardware configuration. It isn't a <a href="https://en.wikipedia.org/wiki/No_Silver_Bullet">silver bullet</a> for the optimization settings of PostgreSQL. Many settings depend not only on the hardware configuration, but also on the size of the database, the number of clients and the complexity of queries, so that optimally configure the database can only be given all these parameters.
    </p>
    <h3>Useful links</h3>
    <ul className="about-page-list">
      <li><a href="https://github.com/le0pard/pgtune">Source code</a></li>
      <li><a href="http://postgresql.leopard.in.ua/">Free PostgreSQL book (Russian language)</a></li>
      <li><a href="http://leopard.in.ua/">My blog</a></li>
    </ul>
  </div>
)

export default AboutPage
