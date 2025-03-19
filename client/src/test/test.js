<div className="container-validate">
  <header className="header-validate">
    <div className="header-left-validate">
      <div className="logo-container-validate">
        <img src="/api/placeholder/100/40" alt="Logo" className="logo-validate" />
      </div>
    </div>

    <div className="header-right-validate">
      <button className="business-btn-validate" onClick={onLogout}>Logout</button>
    </div>
  </header>

  <div className="main-content-validate">
    <div className="sidebar-menu-validate">
      <button><img src="settings-icon.svg" className="menu-icon-validate" /> Settings</button>
      <button><img src="settings-icon.svg" className="menu-icon-validate" /> Validate</button>
      <button><img src="notifications-icon.svg" className="menu-icon-validate" /> Manage Faculty</button>
      <button><img src="notifications-icon.svg" className="menu-icon-validate" /> Notifications</button>
      <button onClick={onLogout}><img src="logout-icon.svg" className="menu-icon-validate" /> Logout</button>
    </div>

    <div className="profile-content-validate">
      <div className="profile-banner-validate">
        <div className="banner-background-validate"></div>
        <div className="edit-button-validate">
          <FaEdit style={{ color: "#0000FF", fontSize: "15px", margin: "5px", fontWeight: "100" }} />
        </div>
      </div>

      <div className="student-certificates-container-validate">
        <div className="student-list-container-validate">
          <div className="section-header-validate">
            <h3>Student List</h3>
          </div>
          <div className="student-list-validate">
            {students.map((student) => (
              <div
                key={student.id}
                className={`student-card-validate ${selectedStudent === student.id ? "selected-validate" : ""}`}
                onClick={() => handleSelectStudent(student.id)}
              >
                <p><strong>{student.name}</strong></p>
                <p>Roll No: {student.rollNo}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="certificate-list-container-validate">
          <div className="section-header-validate">
            <h3>Certificates for {students.find(s => s.id === selectedStudent)?.name}</h3>
          </div>
          {selectedStudent && updatedCertificates[selectedStudent]?.length > 0 ? (
            <div className="certificate-list-validate">
              {updatedCertificates[selectedStudent].map((cert) => (
                <div key={cert.id} className="certificate-card-validate">
                  <p><strong>{cert.name}</strong></p>
                  <p>{cert.description}</p>
                  <p>Status: {cert.status}</p>

                  {cert.status === "Pending" && (
                    <div className="actions-validate">
                      <button className="approve-btn-validate" onClick={() => handleAcceptCertificate(selectedStudent, cert.id)}>Approve</button>
                      <button className="reject-btn-validate" onClick={() => setRejectPopup(cert.id)}>Reject</button>
                    </div>
                  )}

                  {cert.status === "Rejected" && (
                    <p><strong>Rejected Reason:</strong> {cert.rejectReason}</p>
                  )}

                  <div className="view-cert-validate">
                    <FaEye onClick={() => handleViewCertificate(cert.file)} style={{ cursor: "pointer", color: "blue" }} />
                    <a 
                      href={cert.file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="certificate-link-validate"
                      style={{ marginLeft: "10px" }}
                    >
                      View Certificate
                    </a>
                  </div>
                  
                      {/* Optional: Embed PDF Preview */}
                      {/* <iframe 
                        src={cert.file} 
                        width="100%" 
                        height="500px"
                        title={cert.name}
                        style={{ border: "none", marginTop: "10px" }}
                      ></iframe> */}
                </div>
              ))}
            </div>
          ) : (
            <p>No certificates available for this student.</p>
          )}
        </div>
      </div>

      {rejectPopup !== null && (
        <div className="reject-popup-validate">
          <h3>Enter Reason for Rejection</h3>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason..."
          ></textarea>
          <div className="popup-buttons-validate">
            <button onClick={() => handleRejectCertificate(selectedStudent, rejectPopup)}>Confirm</button>
            <button onClick={() => setRejectPopup(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
