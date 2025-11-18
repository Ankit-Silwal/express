export const createUserValidationSchema={
  username:{
    isLength:{
      options:{
        min:5,
        max:32,
      },
      errorMessage:
        "Username must be at least 5 characters with max of 32 characters "
    },
    notEmpty:{
      errorMessage:"Username cannt be empty",
    },
    isString:{
      errorMessage:"Username must be a string",
    },
  },
  displayName:{
    notEmpty:true,
    
  }
  ,
  password: {
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: "Password must be between 8 and 128 characters",
    },
    notEmpty: {
      errorMessage: "Password cannot be empty",
    },
  }
}
export const createQueryValidationSchema = {
  filter: {
    optional: true,          
    isString: {
      errorMessage: "Filter must be a string",
    },
    isLength: {
      options: { min: 3, max: 30 },
      errorMessage: "Filter length must be 3–30 characters",
    },
  },

  value: {
    optional: true,           
    isString: {
      errorMessage: "Value must be a string",
    },
    isLength: {
      options: { min: 1 },
      errorMessage: "Value must not be empty",
    }
  },
};
