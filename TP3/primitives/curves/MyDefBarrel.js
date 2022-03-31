class MyDefBarrel extends CGFobject{

  constructor(scene, base, middle, height, slices, stacks){
    super(scene)
    this.base = base
    this.middle = middle
    this.height = height
    this.slices = slices
    this.stacks = stacks

    this.h = 4/3*this.base
    this.H = 4/3*(this.middle - this.base)
    this.y = 6/5*(this.h+this.H)
    this.z1 = this.height/3
    this.z2 = 2*this.z1

    this.upperSurface = new CGFnurbsSurface(3,3,this.topControlPoints())
    this.barrelUp = new CGFnurbsObject(scene, slices, stacks, this.upperSurface)
    this.downwardSurface = new CGFnurbsSurface(3,3,this.bottomControlPoints())
    this.barrelDown = new CGFnurbsObject(scene,slices,stacks, this.downwardSurface)

  }

  topControlPoints(){
    return[
      [
        [this.base, 0, 0, 1],
        [this.base+this.H, 0, this.z1, 1],
        [this.base+this.H, 0, this.z2, 1],
        [this.base, 0, this.height, 1] 
      ],
      [
        [this.base, this.h, 0, 1],
        [this.base+this.H, this.y, this.z1, 1],
        [this.base+this.H, this.y, this.z2, 1],
        [this.base, this.h, this.height, 1]
      ],
      [
        [-this.base, this.h, 0, 1],
        [-this.base -this.H, this.y, this.z1, 1],
        [-this.base -this.H, this.y, this.z2, 1],
        [-this.base, this.h, this.height, 1]
      ],
      [
        [-this.base, 0, 0, 1],
        [-this.base -this.H, 0,this.z1, 1],
        [-this.base -this.H, 0, this.z2,1],
        [-this.base, 0, this.height,1]
      ]
    ];
  }

  bottomControlPoints(){
    return[
      [
        [-this.base, 0, 0, 1],
        [-this.base -this.H, 0, this.z1, 1],
        [-this.base -this.H, 0, this.z2,1],
        [-this.base, 0, this.height,1]
      ],

      [
        [-this.base, -this.h, 0, 1],
        [-this.base -this.H,-this.y, this.z1, 1],
        [-this.base -this.H, -this.y, this.z2, 1],
        [-this.base, -this.h, this.height, 1]
      ],

      [
        [this.base, -this.h, 0, 1],
        [this.base+this.H,-this.y, this.z1, 1],
        [this.base+this.H, -this.y, this.z2, 1],
        [this.base, -this.h, this.height, 1]
      ],

      [
        [this.base, 0, 0, 1],
        [this.base+this.H, 0, this.z1, 1],
        [this.base+this.H, 0, this.z2, 1],
        [this.base, 0, this.height, 1]
      ]

    ]
  }

  display(){
    this.barrelUp.display()
    this.barrelDown.display()
  }
}