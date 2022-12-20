**Usage**
| Route Name | Required Prameters | Optional Prameters |
|-------------- |------------------------------------------------------------------------------------------------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| /get_person | username: The username to check (String)<br>password: The password of the user (String) | NAN |
| /add_user | username: The username (String)<br>email: The email (String)<br>password: The password (String) | gender: The user gender (Int) 0->Female, 1->male<br>birthday: The user birthday (String) Format YYYY/MM/DD<br>picture: The user profile pic (List(List(Int, Int, Int)) like [[[0, 0, 0]]]<br>first_name: The user first name (String)<br>last_name: The user last name (String) |
| /remove_user | username: The username to remove (String) | |
