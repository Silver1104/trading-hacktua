// import React, { useState } from "react";
// import { Button, Form } from "react-bootstrap";
// import { useNavigate } from "react-router";
// import { useUserAuth } from "../context/UserAuthContext";

// const Home = () => {
//   const { logOut, user, mongoUser, updateUserData, loading } = useUserAuth();
//   const [userData, setUserData] = useState({
//     favoriteColor: mongoUser?.userData?.favoriteColor || "",
//     bio: mongoUser?.userData?.bio || ""
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await logOut();
//       navigate("/");
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({
//       ...userData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await updateUserData(userData);
//       setIsEditing(false);
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

//   if (loading) {
//     return <div className="p-4 box mt-3 text-center">Loading...</div>;
//   }

//   return (
//     <>
//       <div className="p-4 box mt-3">
//         <h2 className="mb-3 text-center">User Profile</h2>
//         <div className="mb-3">
//           <strong>Email:</strong> {user?.email || 'No email'}
//         </div>
//         {user?.phoneNumber && (
//           <div className="mb-3">
//             <strong>Phone:</strong> {user.phoneNumber}
//           </div>
//         )}
//         <div className="mb-3">
//           <strong>Auth Provider:</strong> {mongoUser?.authProvider || 'Unknown'}
//         </div>
        
//         {isEditing ? (
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Favorite Color</Form.Label>
//               <Form.Control 
//                 type="text"
//                 name="favoriteColor"
//                 value={userData.favoriteColor}
//                 onChange={handleInputChange}
//               />
//             </Form.Group>
            
//             <Form.Group className="mb-3">
//               <Form.Label>Bio</Form.Label>
//               <Form.Control 
//                 as="textarea"
//                 rows={3}
//                 name="bio"
//                 value={userData.bio}
//                 onChange={handleInputChange}
//               />
//             </Form.Group>
            
//             <div className="d-flex gap-2">
//               <Button variant="primary" type="submit">
//                 Save
//               </Button>
//               <Button variant="secondary" onClick={() => setIsEditing(false)}>
//                 Cancel
//               </Button>
//             </div>
//           </Form>
//         ) : (
//           <>
//             <div className="mb-3">
//               <strong>Favorite Color:</strong> {mongoUser?.userData?.favoriteColor || 'Not set'}
//             </div>
//             <div className="mb-3">
//               <strong>Bio:</strong> {mongoUser?.userData?.bio || 'Not set'}
//             </div>
//             <Button 
//               variant="outline-primary" 
//               className="mb-3"
//               onClick={() => setIsEditing(true)}
//             >
//               Edit Profile
//             </Button>
//           </>
//         )}
//       </div>
      
//       <div className="d-grid gap-2 mt-3">
//         <Button variant="primary" onClick={handleLogout}>
//           Log out
//         </Button>
//       </div>
//     </>
//   );
// };

// export default Home;

import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";

const Home = () => {
  const { logOut, user, mongoUser, updateUserData, updateProfile, updatePassword, updatePhone, loading } = useUserAuth();
  const [userData, setUserData] = useState({
    favoriteColor: mongoUser?.userData?.favoriteColor || "",
    bio: mongoUser?.userData?.bio || "",
    displayName: user?.displayName || mongoUser?.displayName || "",
    phoneNumber: user?.phoneNumber || mongoUser?.phoneNumber || ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneData, setPhoneData] = useState({
    phoneNumber: "",
    verificationCode: ""
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  // Update userData when mongoUser changes
  useEffect(() => {
    if (mongoUser) {
      setUserData({
        favoriteColor: mongoUser?.userData?.favoriteColor || "",
        bio: mongoUser?.userData?.bio || "",
        displayName: user?.displayName || mongoUser?.displayName || "",
        phoneNumber: user?.phoneNumber || mongoUser?.phoneNumber || ""
      });
    }
  }, [mongoUser, user]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    setPhoneData({
      ...phoneData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      // Update profile data (name, etc) in Firebase
      if (userData.displayName !== (user?.displayName || "")) {
        await updateProfile({
          displayName: userData.displayName
        });
      }
      
      // Update user data in MongoDB
      await updateUserData({
        ...userData,
        displayName: userData.displayName
      });
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile: " + error.message);
      console.log(error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      setError("Failed to update password: " + error.message);
    }
  };

  const handleSendVerification = async () => {
    setError("");
    try {
      await updatePhone(phoneData.phoneNumber);
      setVerificationSent(true);
    } catch (error) {
      setError("Failed to send verification code: " + error.message);
    }
  };

  const handleVerifyPhone = async () => {
    setError("");
    try {
      await updatePhone(phoneData.phoneNumber, phoneData.verificationCode);
      setSuccess("Phone number updated successfully!");
      setShowPhoneModal(false);
      setPhoneData({
        phoneNumber: "",
        verificationCode: ""
      });
      setVerificationSent(false);
    } catch (error) {
      setError("Failed to verify phone number: " + error.message);
    }
  };

  if (loading) {
    return <div className="p-4 box mt-3 text-center">Loading...</div>;
  }

  return (
    <>
      <div className="p-4 box mt-3">
        <h2 className="mb-3 text-center">User Profile</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <div className="mb-3">
          <strong>Email:</strong> {user?.email || 'No email'}
        </div>
        <div className="mb-3">
          <strong>Name:</strong> {user?.displayName || mongoUser?.displayName || 'Not set'}
        </div>
        <div className="mb-3">
          <strong>Phone:</strong> {user?.phoneNumber || mongoUser?.phoneNumber || 'Not set'}
        </div>
        <div className="mb-3">
          <strong>Auth Provider:</strong> {mongoUser?.authProvider || 'Unknown'}
        </div>
        
        {isEditing ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Display Name</Form.Label>
              <Form.Control 
                type="text"
                name="displayName"
                value={userData.displayName}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Favorite Color</Form.Label>
              <Form.Control 
                type="text"
                name="favoriteColor"
                value={userData.favoriteColor}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                name="bio"
                value={userData.bio}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                Save Profile
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <div className="mb-3">
              <strong>Favorite Color:</strong> {mongoUser?.userData?.favoriteColor || 'Not set'}
            </div>
            <div className="mb-3">
              <strong>Bio:</strong> {mongoUser?.userData?.bio || 'Not set'}
            </div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Button 
                variant="outline-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
              <Button 
                variant="outline-info"
                onClick={() => setShowPhoneModal(true)}
              >
                Update Phone
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control 
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control 
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control 
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Phone Update Modal */}
      <Modal show={showPhoneModal} onHide={() => {
        setShowPhoneModal(false);
        setVerificationSent(false);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Update Phone Number</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control 
                type="tel"
                name="phoneNumber"
                value={phoneData.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+1234567890"
                disabled={verificationSent}
                required
              />
              <Form.Text className="text-muted">
                Enter phone number with country code (e.g., +1 for US)
              </Form.Text>
            </Form.Group>
            
            {verificationSent && (
              <Form.Group className="mb-3">
                <Form.Label>Verification Code</Form.Label>
                <Form.Control 
                  type="text"
                  name="verificationCode"
                  value={phoneData.verificationCode}
                  onChange={handlePhoneChange}
                  required
                />
              </Form.Group>
            )}
            
            {!verificationSent ? (
              <div id="recaptcha-container"></div>
            ) : null}
            
            <Button 
              variant="primary" 
              onClick={verificationSent ? handleVerifyPhone : handleSendVerification}
            >
              {verificationSent ? "Verify Code" : "Send Verification Code"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
      <div className="d-grid gap-2 mt-3">
        <Button variant="primary" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </>
  );
};

export default Home;