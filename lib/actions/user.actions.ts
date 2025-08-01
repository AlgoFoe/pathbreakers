'use server'

import { revalidatePath } from 'next/cache'

import User from '../database/models/user.model'
import { connectToDatabase } from '../database/mongoose'
import { handleError } from '../utils'

interface CreateUserParam {
  clerkId: string;
  email: string;
  username: string;
  firstName: string|null;
  lastName: string;
  photo: string;
}
// CREATE
export async function createUser(user: CreateUserParam) {
  try {
    await connectToDatabase()
    console.log('user created')
    const newUser = await User.create(user)

    return JSON.parse(JSON.stringify(newUser))
  } catch (error) { 
    handleError(error)
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId: userId })
    console.log('get user by id')
    if (!user) throw new Error('User not found')

    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    handleError(error)
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase()
    console.log('user update successful')

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    })

    if (!updatedUser) throw new Error('User update failed')

    return JSON.parse(JSON.stringify(updatedUser))
  } catch (error) {
    handleError(error)
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase()
    console.log('user deleted')
    // Find user to delete
    const userToDelete = await User.findOne({ clerkId })

    if (!userToDelete) {
      throw new Error('User not found')
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id)
    revalidatePath('/')

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
  } catch (error) {
    handleError(error)
  }
}
