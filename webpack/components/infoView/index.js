import React from 'react'

import './info-view.sass'

const InfoView = () => (
  <div>
    <p>
      You need provide basic information about your hardware configuration, where is working PostgreSQL database. Results will be calculated after clicking "Generate" button
    </p>
    <p className="info-view-db-type__description">More information about "DB Type" setting:</p>
    <ul className="info-view-db-type__list">
      <li>
        <div className="info-view-db-type__header">Web Application (web)</div>
        <ul>
          <li>Typically CPU-bound</li>
          <li>DB much smaller than RAM</li>
          <li>90% or more simple queries</li>
        </ul>
      </li>
      <li>
        <div className="info-view-db-type__header">Online Transaction Processing (oltp)</div>
        <ul>
          <li>Typically CPU- or I/O-bound</li>
          <li>DB slightly larger than RAM to 1TB</li>
          <li>20-40% small data write queries</li>
          <li>Some long transactions and complex read queries</li>
        </ul>
      </li>
      <li>
        <div className="info-view-db-type__header">Data Warehouse (dw)</div>
        <ul>
          <li>Typically I/O- or RAM-bound</li>
          <li>Large bulk loads of data</li>
          <li>Large complex reporting queries</li>
          <li>Also called "Decision Support" or "Business Intelligence"</li>
        </ul>
      </li>
      <li>
        <div className="info-view-db-type__header">Desktop application</div>
        <ul>
          <li>Not a dedicated database</li>
          <li>A general workstation, perhaps for a developer</li>
        </ul>
      </li>
      <li>
        <div className="info-view-db-type__header">Mixed type of application</div>
        <ul>
          <li>Mixed DW and OLTP characteristics</li>
          <li>A wide mixture of queries</li>
        </ul>
      </li>
    </ul>
  </div>
)

export default InfoView
