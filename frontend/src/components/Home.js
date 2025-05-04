import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";

const Home = () => {
  const { logOut, user, mongoUser, updateUserData, loading } = useUserAuth();
  const [userData, setUserData] = useState({
    favoriteColor: mongoUser?.userData?.favoriteColor || "",
    bio: mongoUser?.userData?.bio || ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserData(userData);
      setIsEditing(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return <div className="p-4 box mt-3 text-center">Loading...</div>;
  }

  return (
    <>
      <div className="p-4 box mt-3">
        <h2 className="mb-3 text-center">User Profile</h2>
        <div className="mb-3">
          <strong>Email:</strong> {user?.email || 'No email'}
        </div>
        {user?.phoneNumber && (
          <div className="mb-3">
            <strong>Phone:</strong> {user.phoneNumber}
          </div>
        )}
        <div className="mb-3">
          <strong>Auth Provider:</strong> {mongoUser?.authProvider || 'Unknown'}
        </div>
        
        {isEditing ? (
          <Form onSubmit={handleSubmit}>
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
                Save
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
            <Button 
              variant="outline-primary" 
              className="mb-3"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </>
        )}
      </div>
      
      <div className="d-grid gap-2 mt-3">
        <Button variant="primary" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </>
  );
};

export default Home;