using ChurchManagement.API.DTOs.Families;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FamiliesController : ControllerBase
{
    private readonly FamilyService _familyService;

    public FamiliesController(FamilyService familyService)
    {
        _familyService = familyService;
    }

    [HttpGet]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetAll()
    {
        var families = await _familyService.GetAllAsync();

        return Ok(families);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetById(int id)
    {
        var family = await _familyService.GetByIdAsync(id);

        if (family == null)
        {
            return NotFound(new
            {
                message = "Family not found."
            });
        }

        return Ok(family);
    }

    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateFamilyRequest request)
    {
        var result =
            await _familyService.CreateAsync(request);

        if (result.Error != null)
        {
            return Conflict(new
            {
                message = result.Error
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Family!.FamilyId },
            result.Family);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateFamilyRequest request)
    {
        var result =
            await _familyService.UpdateAsync(id, request);

        if (result.Error != null)
        {
            if (result.Error == "Family not found.")
            {
                return NotFound(new
                {
                    message = result.Error
                });
            }

            return Conflict(new
            {
                message = result.Error
            });
        }

        return Ok(result.Family);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var result =
            await _familyService.DeleteAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Family not found."
            });
        }

        return NoContent();
    }
}